'use client';

import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import type { DonationCause } from '@hss/domain';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatIndianCurrency } from '@/lib/format';
import { getIntlLocale, pickLanguage } from '@/lib/i18n';

const presetAmounts = [100, 500, 1000, 5000];

type FieldErrors = Record<string, string[] | undefined>;

interface DonateFormProps {
  qrImageUrl: string;
  qrTitle: string;
  qrNote: string;
  qrConfigured: boolean;
  selectedCause?: DonationCause;
}

const copy = {
  en: {
    step1Label: 'Step 1',
    stepsLabel: 'Steps',
    warning:
      'QR image is using the placeholder. Set `NEXT_PUBLIC_DONATION_QR_IMAGE_URL` or place your real image in `public/donation-qr.jpeg` before the final demo.',
    step1: 'Scan the QR code and complete the payment from any UPI app.',
    step2: 'Take a screenshot after payment succeeds.',
    step3: 'Fill your details below and upload that screenshot.',
    step4: 'Admin will verify the proof and then acknowledge the donation.',
    preset: 'Preset',
    amount: 'Donation Amount',
    donorName: 'Donor Name',
    donorEmail: 'Email Address',
    donorPhone: 'Phone Number',
    private: 'Keep my contribution private on the public donors page after verification',
    screenshot: 'Payment Screenshot',
    screenshotPlaceholder: 'Upload JPG, PNG, or WebP screenshot (max 5MB)',
    choose: 'Choose',
    missingScreenshot: 'Please upload the payment screenshot after completing the QR payment.',
    submit: 'Submit Donation Proof',
    submitting: 'Submitting for Verification...',
    error: 'Unable to submit donation proof',
    success: 'Donation proof submitted successfully.',
    namePlaceholder: 'Your full name',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    selectedCause: 'Selected Cause',
    noCause: 'General donation',
  },
  hi: {
    step1Label: 'चरण 1',
    stepsLabel: 'चरण',
    warning:
      'QR इमेज अभी placeholder है। अंतिम डेमो से पहले `NEXT_PUBLIC_DONATION_QR_IMAGE_URL` सेट करें या `public/donation-qr.jpeg` में असली इमेज रखें।',
    step1: 'QR कोड स्कैन करें और किसी भी UPI ऐप से भुगतान पूरा करें।',
    step2: 'भुगतान सफल होने के बाद स्क्रीनशॉट लें।',
    step3: 'नीचे अपनी जानकारी भरें और वही स्क्रीनशॉट अपलोड करें।',
    step4: 'एडमिन प्रमाण की जाँच कर दान सत्यापित करेगा।',
    preset: 'प्रीसेट',
    amount: 'दान राशि',
    donorName: 'दाता का नाम',
    donorEmail: 'ईमेल पता',
    donorPhone: 'फोन नंबर',
    private: 'सत्यापन के बाद सार्वजनिक दाता पेज पर मेरा योगदान निजी रखें',
    screenshot: 'भुगतान स्क्रीनशॉट',
    screenshotPlaceholder: 'JPG, PNG, या WebP स्क्रीनशॉट अपलोड करें (अधिकतम 5MB)',
    choose: 'चुनें',
    missingScreenshot: 'QR भुगतान पूरा करने के बाद कृपया भुगतान स्क्रीनशॉट अपलोड करें।',
    submit: 'दान प्रमाण जमा करें',
    submitting: 'सत्यापन हेतु जमा हो रहा है...',
    error: 'दान प्रमाण जमा नहीं हो सका',
    success: 'दान प्रमाण सफलतापूर्वक जमा हो गया।',
    namePlaceholder: 'आपका पूरा नाम',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    selectedCause: 'चयनित उद्देश्य',
    noCause: 'सामान्य दान',
  },
  mr: {
    step1Label: 'पायरी 1',
    stepsLabel: 'पायऱ्या',
    warning:
      'QR प्रतिमा अजून placeholder आहे. अंतिम डेमोपूर्वी `NEXT_PUBLIC_DONATION_QR_IMAGE_URL` सेट करा किंवा `public/donation-qr.jpeg` मध्ये खरी प्रतिमा ठेवा.',
    step1: 'QR कोड स्कॅन करा आणि कोणत्याही UPI अॅपद्वारे पेमेंट पूर्ण करा.',
    step2: 'पेमेंट यशस्वी झाल्यावर स्क्रीनशॉट घ्या.',
    step3: 'खाली आपली माहिती भरा आणि तोच स्क्रीनशॉट अपलोड करा.',
    step4: 'अॅडमिन पुरावा तपासून दानाची नोंद निश्चित करेल.',
    preset: 'प्रीसेट',
    amount: 'दान रक्कम',
    donorName: 'दात्याचे नाव',
    donorEmail: 'ईमेल पत्ता',
    donorPhone: 'फोन नंबर',
    private: 'सत्यापनानंतर सार्वजनिक दाता पृष्ठावर माझे योगदान खाजगी ठेवा',
    screenshot: 'पेमेंट स्क्रीनशॉट',
    screenshotPlaceholder: 'JPG, PNG, किंवा WebP स्क्रीनशॉट अपलोड करा (कमाल 5MB)',
    choose: 'निवडा',
    missingScreenshot: 'QR पेमेंट पूर्ण केल्यानंतर कृपया पेमेंट स्क्रीनशॉट अपलोड करा.',
    submit: 'दानाचा पुरावा जमा करा',
    submitting: 'सत्यापनासाठी जमा होत आहे...',
    error: 'दानाचा पुरावा जमा करता आला नाही',
    success: 'दानाचा पुरावा यशस्वीरित्या जमा झाला.',
    namePlaceholder: 'आपले पूर्ण नाव',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    selectedCause: 'निवडलेला उद्देश',
    noCause: 'सामान्य दान',
  },
} as const;

export default function DonateForm({
  qrImageUrl,
  qrTitle,
  qrNote,
  qrConfigured,
  selectedCause,
}: DonateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(500);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const locale = getIntlLocale(language);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('amount', String(amount));
    formData.set('isAnonymous', String(isAnonymous));
    if (selectedCause) {
      formData.set('cause', selectedCause);
    }

    const screenshot = formData.get('screenshot');
    if (!(screenshot instanceof File) || screenshot.size === 0) {
      setError(text.missingScreenshot);
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/donations/create-order', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || text.error);
        setFieldErrors(result.details || {});
        return;
      }

      form.reset();
      setDonorName('');
      setDonorEmail('');
      setDonorPhone('');
      setAmount(500);
      setIsAnonymous(false);
      setSelectedScreenshot(null);
      setMessage(result.message || text.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
      {selectedCause ? <input type="hidden" name="cause" value={selectedCause} /> : null}

      <section className="rounded-3xl border border-stone-temple bg-stone-temple/35 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-3xl border border-stone-temple bg-white p-3 shadow-sm sm:mx-0">
            <Image
              src={qrImageUrl}
              alt={qrTitle}
              fill
              sizes="208px"
              className="rounded-2xl object-contain p-3"
            />
          </div>
          <div className="flex-1">
            <p className="eyebrow">{text.step1Label}</p>
            <h2 className="mt-4 text-2xl font-semibold text-brown-dark">{qrTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-brown-dark/75">{qrNote}</p>
            {!qrConfigured ? (
              <p className="mt-4 rounded-2xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">
                {text.warning}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-3xl border border-saffron/20 bg-saffron/5 px-5 py-5">
        <p className="eyebrow">{text.stepsLabel}</p>
        <ol className="mt-4 space-y-3 text-sm leading-7 text-brown-dark/75">
          <li>1. {text.step1}</li>
          <li>2. {text.step2}</li>
          <li>3. {text.step3}</li>
          <li>4. {text.step4}</li>
        </ol>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {presetAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                amount === value
                  ? 'border-saffron bg-saffron text-white'
                  : 'border-stone-temple bg-white hover:border-saffron/40 hover:bg-saffron/5'
              }`}
            >
              <span className="block text-xs uppercase tracking-[0.2em] opacity-70">{text.preset}</span>
              <span className="mt-1 block text-xl font-semibold">{formatIndianCurrency(value, locale)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="amount" className="field-label">
          {text.amount}
        </label>
        <input
          id="amount"
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value) || 0)}
          className="input-field"
        />
        {fieldErrors.amount?.[0] ? <p className="error-text">{fieldErrors.amount[0]}</p> : null}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="donorName" className="field-label">
            {text.donorName}
          </label>
          <input
            id="donorName"
            name="donorName"
            value={donorName}
            onChange={(event) => setDonorName(event.target.value)}
            className="input-field"
            placeholder={text.namePlaceholder}
            required
          />
          {fieldErrors.donorName?.[0] ? <p className="error-text">{fieldErrors.donorName[0]}</p> : null}
        </div>
        <div>
          <label htmlFor="donorEmail" className="field-label">
            {text.donorEmail}
          </label>
          <input
            id="donorEmail"
            name="donorEmail"
            type="email"
            value={donorEmail}
            onChange={(event) => setDonorEmail(event.target.value)}
            className="input-field"
            placeholder={text.emailPlaceholder}
          />
          {fieldErrors.donorEmail?.[0] ? <p className="error-text">{fieldErrors.donorEmail[0]}</p> : null}
        </div>
        <div>
          <label htmlFor="donorPhone" className="field-label">
            {text.donorPhone}
          </label>
          <input
            id="donorPhone"
            name="donorPhone"
            value={donorPhone}
            onChange={(event) => setDonorPhone(event.target.value)}
            className="input-field"
            placeholder={text.phonePlaceholder}
            required
          />
          {fieldErrors.donorPhone?.[0] ? <p className="error-text">{fieldErrors.donorPhone[0]}</p> : null}
        </div>
        <label className="mt-8 flex items-center gap-3 rounded-2xl border border-stone-temple bg-stone-temple/40 px-4 py-3 text-sm text-brown-dark">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="h-4 w-4 rounded border-stone-temple text-saffron focus:ring-saffron"
          />
          {text.private}
        </label>
      </div>

      <div className="mt-5">
        <label htmlFor="screenshot" className="field-label">
          {text.screenshot}
        </label>
        <label className="flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
          <span>{selectedScreenshot || text.screenshotPlaceholder}</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
            {text.choose}
          </span>
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => setSelectedScreenshot(event.target.files?.[0]?.name || null)}
          />
        </label>
        {fieldErrors.screenshot?.[0] ? <p className="error-text">{fieldErrors.screenshot[0]}</p> : null}
      </div>

      {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isPending || amount < 1}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? text.submitting : text.submit}
      </button>
    </form>
  );
}
