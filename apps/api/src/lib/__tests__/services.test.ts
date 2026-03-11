import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decryptSensitiveValue } from '../encryption';
import { AppError } from '../errors';

const getDbMock = vi.fn();
const uploadImageFileMock = vi.fn();
const deleteUploadedFileMock = vi.fn();
const ensureUserIdentityAvailableMock = vi.fn();
const prepareUserAccountDataMock = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: getDbMock,
}));

vi.mock('@/lib/upload', () => ({
  uploadImageFile: uploadImageFileMock,
  deleteUploadedFile: deleteUploadedFileMock,
  uploadLimits: {
    memberPhoto: 2 * 1024 * 1024,
    donationProof: 5 * 1024 * 1024,
  },
}));

vi.mock('@/lib/services/users', async () => {
  const actual = await vi.importActual<typeof import('@/lib/services/users')>('@/lib/services/users');
  return {
    ...actual,
    ensureUserIdentityAvailable: ensureUserIdentityAvailableMock,
    prepareUserAccountData: prepareUserAccountDataMock,
  };
});

describe('member and donation services', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    getDbMock.mockReset();
    uploadImageFileMock.mockReset();
    deleteUploadedFileMock.mockReset();
    ensureUserIdentityAvailableMock.mockReset();
    prepareUserAccountDataMock.mockReset();
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
    vi.clearAllMocks();
  });

  it('creates a member application with encrypted Aadhaar and private photo proof', async () => {
    const userCreate = vi.fn().mockResolvedValue({ id: 'user-1' });
    const userDelete = vi.fn().mockResolvedValue(true);
    const memberCreate = vi.fn().mockResolvedValue({ id: 'member-1', status: 'PENDING' });

    getDbMock.mockResolvedValue({
      user: { create: userCreate, delete: userDelete },
      member: { create: memberCreate },
    });

    ensureUserIdentityAvailableMock.mockResolvedValue(undefined);
    prepareUserAccountDataMock.mockResolvedValue({
      name: 'Hari',
      email: 'hari@example.com',
      phone: '9876543210',
      passwordHash: 'hashed',
      role: 'MEMBER',
      isActive: true,
      isApproved: false,
      emailVerified: false,
      avatar: undefined,
    });

    uploadImageFileMock.mockResolvedValue({
      key: 'private/members/photos/hari.png',
      url: '/api/admin/files?key=private%2Fmembers%2Fphotos%2Fhari.png',
      visibility: 'private',
      contentType: 'image/png',
    });

    const { submitMemberApplication } = await import('../services/member-application');
    const result = await submitMemberApplication({
      fullName: 'Hari',
      fatherName: 'Mahesh',
      dob: '1995-01-10',
      gender: 'Male',
      bloodGroup: 'O+',
      aadharNumber: '123456789012',
      address: 'Ward 2, Ramnagar',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '440001',
      occupation: 'Volunteer',
      phone: '9876543210',
      email: 'hari@example.com',
      password: 'StrongPass@123',
      confirmPassword: 'StrongPass@123',
      photo: new File(['photo'], 'hari.png', { type: 'image/png' }),
    });

    expect(result).toEqual({
      userId: 'user-1',
      memberId: 'member-1',
      status: 'PENDING',
    });

    const createdMember = memberCreate.mock.calls[0]?.[0];
    expect(createdMember.userId).toBe('user-1');
    expect(createdMember.photo).toContain('/api/admin/files?key=');
    expect(createdMember.aadharNumber).not.toBe('123456789012');
    expect(decryptSensitiveValue(createdMember.aadharNumber)).toBe('123456789012');
  });

  it('surfaces duplicate-user rejection before uploads happen', async () => {
    ensureUserIdentityAvailableMock.mockRejectedValue(
      new AppError('An account with this email already exists', 409)
    );

    const { submitMemberApplication } = await import('../services/member-application');

    await expect(
      submitMemberApplication({
        fullName: 'Hari',
        fatherName: 'Mahesh',
        dob: '1995-01-10',
        gender: 'Male',
        address: 'Ward 2, Ramnagar',
        district: 'Nagpur',
        state: 'Maharashtra',
        pincode: '440001',
        phone: '9876543210',
        email: 'hari@example.com',
        password: 'StrongPass@123',
        confirmPassword: 'StrongPass@123',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(uploadImageFileMock).not.toHaveBeenCalled();
  });

  it('stores manual donation proofs as private uploads pending review', async () => {
    const donationCreate = vi.fn().mockResolvedValue({
      id: 'donation-1',
      status: 'PENDING',
    });

    getDbMock.mockResolvedValue({
      donation: { create: donationCreate },
    });

    uploadImageFileMock.mockResolvedValue({
      key: 'private/donations/proofs/txn-proof.png',
      url: '/api/admin/files?key=private%2Fdonations%2Fproofs%2Ftxn-proof.png',
      visibility: 'private',
      contentType: 'image/png',
    });

    const { submitManualDonationService } = await import('../services/donations');
    const result = await submitManualDonationService({
      donorName: 'Hari',
      donorEmail: 'hari@example.com',
      donorPhone: '9876543210',
      amount: 501,
      isAnonymous: false,
      screenshot: new File(['proof'], 'proof.png', { type: 'image/png' }),
    });

    expect(result).toMatchObject({
      donationId: 'donation-1',
      status: 'PENDING',
    });

    expect(donationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMode: 'MANUAL_UPI',
        paymentProofKey: 'private/donations/proofs/txn-proof.png',
        paymentProofStatus: 'PENDING_REVIEW',
        receipt: undefined,
      })
    );
  });
});
