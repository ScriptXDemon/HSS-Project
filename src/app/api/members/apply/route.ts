import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { AppError } from '@/lib/errors';
import { submitMemberApplication } from '@/lib/services/member-application';

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photoValue = formData.get('photo');
    const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;

    const result = await submitMemberApplication({
      fullName: getRequiredString(formData, 'fullName'),
      fatherName: getRequiredString(formData, 'fatherName'),
      dob: getRequiredString(formData, 'dob'),
      gender: getRequiredString(formData, 'gender') as 'Male' | 'Female' | 'Other',
      bloodGroup: getRequiredString(formData, 'bloodGroup'),
      aadharNumber: getRequiredString(formData, 'aadharNumber'),
      address: getRequiredString(formData, 'address'),
      district: getRequiredString(formData, 'district'),
      state: getRequiredString(formData, 'state'),
      pincode: getRequiredString(formData, 'pincode'),
      occupation: getRequiredString(formData, 'occupation'),
      phone: getRequiredString(formData, 'phone'),
      email: getRequiredString(formData, 'email'),
      password: getRequiredString(formData, 'password'),
      confirmPassword: getRequiredString(formData, 'confirmPassword'),
      photo,
    });

    return NextResponse.json(
      {
        message: 'Membership application submitted successfully',
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Member application error:', error);
    }

    return createErrorResponse(error);
  }
}
