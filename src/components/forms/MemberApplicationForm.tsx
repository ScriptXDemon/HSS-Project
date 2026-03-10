'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

type FieldErrors = Record<string, string[] | undefined>;

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const copy = {
  en: {
    fullName: 'Full Name',
    fatherName: "Father's Name",
    dob: 'Date of Birth',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    bloodGroup: 'Blood Group',
    bloodPlaceholder: 'Select blood group',
    occupation: 'Occupation',
    address: 'Address',
    district: 'District',
    state: 'State',
    pincode: 'Pincode',
    phone: 'Phone Number',
    email: 'Email Address',
    password: 'Account Password',
    passwordHelp: 'Use at least 8 characters with uppercase, lowercase, number, and symbol.',
    confirmPassword: 'Confirm Password',
    aadhar: 'Aadhar Number',
    aadharHelp: 'Stored securely using AES-256-GCM encryption.',
    photo: 'Profile Photo',
    photoPlaceholder: 'Upload JPG, PNG, or WebP (max 2MB)',
    choose: 'Choose',
    genericError: 'Unable to submit application',
    success:
      'Your application has been submitted. You can now sign in with your new account while approval is pending.',
    proceedLogin: 'Proceed to login',
    submit: 'Submit Membership Application',
    submitting: 'Submitting Application...',
  },
  hi: {
    fullName: 'पूरा नाम',
    fatherName: 'पिता का नाम',
    dob: 'जन्म तिथि',
    gender: 'लिंग',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    bloodGroup: 'ब्लड ग्रुप',
    bloodPlaceholder: 'ब्लड ग्रुप चुनें',
    occupation: 'व्यवसाय',
    address: 'पता',
    district: 'जिला',
    state: 'राज्य',
    pincode: 'पिनकोड',
    phone: 'फोन नंबर',
    email: 'ईमेल पता',
    password: 'खाते का पासवर्ड',
    passwordHelp: 'कम से कम 8 अक्षर रखें, जिनमें अपरकेस, लोअरकेस, संख्या और चिन्ह हो।',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    aadhar: 'आधार नंबर',
    aadharHelp: 'AES-256-GCM एन्क्रिप्शन के साथ सुरक्षित रखा जाता है।',
    photo: 'प्रोफाइल फोटो',
    photoPlaceholder: 'JPG, PNG, या WebP अपलोड करें (अधिकतम 2MB)',
    choose: 'चुनें',
    genericError: 'आवेदन जमा नहीं हो सका',
    success:
      'आपका आवेदन जमा हो गया है। अब आप अपने नए खाते से लॉगिन कर सकते हैं, जबकि अनुमोदन लंबित है।',
    proceedLogin: 'लॉगिन पर जाएँ',
    submit: 'सदस्यता आवेदन जमा करें',
    submitting: 'आवेदन जमा हो रहा है...',
  },
} as const;

export default function MemberApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  function getFieldError(key: string) {
    return fieldErrors[key]?.[0];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmissionMessage(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch('/api/members/apply', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.error || text.genericError);
        setFieldErrors(result.details || {});
        return;
      }

      form.reset();
      setSelectedFileName(null);
      setSubmissionMessage(text.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="field-label">{text.fullName}</label>
          <input id="fullName" name="fullName" className="input-field" required />
          {getFieldError('fullName') ? <p className="error-text">{getFieldError('fullName')}</p> : null}
        </div>
        <div>
          <label htmlFor="fatherName" className="field-label">{text.fatherName}</label>
          <input id="fatherName" name="fatherName" className="input-field" required />
          {getFieldError('fatherName') ? <p className="error-text">{getFieldError('fatherName')}</p> : null}
        </div>
        <div>
          <label htmlFor="dob" className="field-label">{text.dob}</label>
          <input id="dob" name="dob" type="date" className="input-field" required />
          {getFieldError('dob') ? <p className="error-text">{getFieldError('dob')}</p> : null}
        </div>
        <div>
          <label htmlFor="gender" className="field-label">{text.gender}</label>
          <select id="gender" name="gender" className="select-field" defaultValue="Male">
            <option value="Male">{text.genderMale}</option>
            <option value="Female">{text.genderFemale}</option>
            <option value="Other">{text.genderOther}</option>
          </select>
          {getFieldError('gender') ? <p className="error-text">{getFieldError('gender')}</p> : null}
        </div>
        <div>
          <label htmlFor="bloodGroup" className="field-label">{text.bloodGroup}</label>
          <select id="bloodGroup" name="bloodGroup" className="select-field" defaultValue="">
            <option value="">{text.bloodPlaceholder}</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {getFieldError('bloodGroup') ? <p className="error-text">{getFieldError('bloodGroup')}</p> : null}
        </div>
        <div>
          <label htmlFor="occupation" className="field-label">{text.occupation}</label>
          <input id="occupation" name="occupation" className="input-field" />
          {getFieldError('occupation') ? <p className="error-text">{getFieldError('occupation')}</p> : null}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="address" className="field-label">{text.address}</label>
        <textarea id="address" name="address" className="textarea-field" required />
        {getFieldError('address') ? <p className="error-text">{getFieldError('address')}</p> : null}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="district" className="field-label">{text.district}</label>
          <input id="district" name="district" className="input-field" required />
          {getFieldError('district') ? <p className="error-text">{getFieldError('district')}</p> : null}
        </div>
        <div>
          <label htmlFor="state" className="field-label">{text.state}</label>
          <input id="state" name="state" className="input-field" required />
          {getFieldError('state') ? <p className="error-text">{getFieldError('state')}</p> : null}
        </div>
        <div>
          <label htmlFor="pincode" className="field-label">{text.pincode}</label>
          <input id="pincode" name="pincode" className="input-field" required />
          {getFieldError('pincode') ? <p className="error-text">{getFieldError('pincode')}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="field-label">{text.phone}</label>
          <input id="phone" name="phone" className="input-field" required />
          {getFieldError('phone') ? <p className="error-text">{getFieldError('phone')}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className="field-label">{text.email}</label>
          <input id="email" name="email" type="email" className="input-field" required />
          {getFieldError('email') ? <p className="error-text">{getFieldError('email')}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="password" className="field-label">{text.password}</label>
          <input id="password" name="password" type="password" className="input-field" required />
          <p className="helper-text">{text.passwordHelp}</p>
          {getFieldError('password') ? <p className="error-text">{getFieldError('password')}</p> : null}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="field-label">{text.confirmPassword}</label>
          <input id="confirmPassword" name="confirmPassword" type="password" className="input-field" required />
          {getFieldError('confirmPassword') ? <p className="error-text">{getFieldError('confirmPassword')}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="aadharNumber" className="field-label">{text.aadhar}</label>
          <input id="aadharNumber" name="aadharNumber" className="input-field" maxLength={12} />
          <p className="helper-text">{text.aadharHelp}</p>
          {getFieldError('aadharNumber') ? <p className="error-text">{getFieldError('aadharNumber')}</p> : null}
        </div>
        <div>
          <label htmlFor="photo" className="field-label">{text.photo}</label>
          <label className="flex min-h-[54px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
            <span>{selectedFileName || text.photoPlaceholder}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">{text.choose}</span>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name || null)}
            />
          </label>
          {getFieldError('photo') ? <p className="error-text">{getFieldError('photo')}</p> : null}
        </div>
      </div>

      {formError ? <p className="mt-6 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{formError}</p> : null}
      {submissionMessage ? (
        <div className="mt-6 rounded-2xl bg-green-50 px-4 py-4 text-sm text-green-700">
          <p>{submissionMessage}</p>
          <Link href="/login" className="mt-2 inline-block font-semibold text-green-800 underline">
            {text.proceedLogin}
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? text.submitting : text.submit}
      </button>
    </form>
  );
}
