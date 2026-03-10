import { Prisma } from '@prisma/client';
import { getActiveEngine, getDb } from '@/lib/db';
import type { IMember } from '@/lib/db/types';
import { prisma } from '@/lib/db/prisma/client';
import { encryptSensitiveValue } from '@/lib/encryption';
import { AppError } from '@/lib/errors';
import { deleteUploadedFile, uploadImageFile, uploadLimits } from '@/lib/upload';
import { memberApplySchema } from '@/lib/validators';
import {
  ensureUserIdentityAvailable,
  normalizeOptionalString,
  prepareUserAccountData,
} from './users';

export interface MemberApplicationInput {
  fullName: string;
  fatherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  aadharNumber?: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  occupation?: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  photo?: File | null;
}

interface MemberApplicationResult {
  userId: string;
  memberId: string;
  status: IMember['status'];
}

function buildMemberRecord(input: MemberApplicationInput, userId: string, photoUrl?: string) {
  return {
    userId,
    fullName: input.fullName.trim(),
    fatherName: input.fatherName.trim(),
    dob: new Date(input.dob),
    gender: input.gender,
    bloodGroup: normalizeOptionalString(input.bloodGroup),
    aadharNumber: input.aadharNumber
      ? encryptSensitiveValue(input.aadharNumber.trim())
      : undefined,
    address: input.address.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    occupation: normalizeOptionalString(input.occupation),
    photo: photoUrl,
    status: 'PENDING' as const,
  };
}

function mapPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new AppError('An account with this email or phone number already exists', 409);
  }

  throw error;
}

export async function submitMemberApplication(
  input: MemberApplicationInput
): Promise<MemberApplicationResult> {
  const parsed = memberApplySchema.safeParse({
    ...input,
    email: input.email.trim().toLowerCase(),
    bloodGroup: normalizeOptionalString(input.bloodGroup),
    aadharNumber: normalizeOptionalString(input.aadharNumber),
    occupation: normalizeOptionalString(input.occupation),
  });

  if (!parsed.success) {
    throw new AppError('Validation failed', 400, parsed.error.flatten().fieldErrors);
  }

  await ensureUserIdentityAvailable(parsed.data.email, parsed.data.phone);

  let uploadedPhotoKey: string | undefined;
  let uploadedPhotoUrl: string | undefined;

  if (input.photo && input.photo.size > 0) {
    const uploaded = await uploadImageFile(input.photo, {
      folder: 'members/photos',
      maxSizeBytes: uploadLimits.memberPhoto,
    });
    uploadedPhotoKey = uploaded.key;
    uploadedPhotoUrl = uploaded.url;
  }

  try {
    const userData = await prepareUserAccountData({
      name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: parsed.data.password,
      isApproved: false,
      role: 'MEMBER',
    });

    const memberData = buildMemberRecord(parsed.data, '__REPLACE_USER_ID__', uploadedPhotoUrl);

    if (getActiveEngine() === 'postgres') {
      try {
        const created = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: userData,
          });

          const member = await tx.member.create({
            data: {
              ...memberData,
              userId: user.id,
            },
          });

          return { user, member };
        });

        return {
          userId: created.user.id,
          memberId: created.member.id,
          status: created.member.status,
        };
      } catch (error) {
        mapPrismaError(error);
      }
    }

    const db = await getDb();
    const user = await db.user.create(userData);

    try {
      const member = await db.member.create({
        ...memberData,
        userId: user.id,
      });

      return {
        userId: user.id,
        memberId: member.id,
        status: member.status,
      };
    } catch (error) {
      await db.user.delete(user.id);
      throw error;
    }
  } catch (error) {
    if (uploadedPhotoKey) {
      await deleteUploadedFile(uploadedPhotoKey).catch(() => undefined);
    }

    if (error instanceof AppError) {
      throw error;
    }

    mapPrismaError(error);
  }

  throw new AppError('Unable to submit membership application', 500);
}
