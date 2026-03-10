import { cookies } from 'next/headers';
import Link from 'next/link';
import DonateForm from '@/components/forms/DonateForm';
import PageHero from '@/components/shared/PageHero';
import { getDonationQrConfig } from '@/lib/donation-config';
import { formatIndianCurrency } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    eyebrow: 'Support the Mission',
    title: 'Fund service, outreach, and community action',
    description:
      'Your contribution powers local events, volunteer coordination, public awareness efforts, and on-ground support for social initiatives.',
    impactEyebrow: 'Impact Guide',
    impactTitle: 'Where contributions help immediately',
    impactPoints: [
      { title: 'Volunteer Mobilisation', amount: 500 },
      { title: 'Community Event Support', amount: 1000 },
      { title: 'Outreach Material & Logistics', amount: 5000 },
    ],
    transparencyTitle: 'Transparency note',
    transparencyDescription:
      'Non-anonymous donations should only appear on the public donors page after the admin verifies the uploaded payment proof. If you prefer privacy, enable the anonymous option before submitting the form.',
    viewDonors: 'View public donors',
  },
  hi: {
    eyebrow: 'मिशन का समर्थन करें',
    title: 'सेवा, संपर्क और सामाजिक कार्य के लिए सहयोग दें',
    description:
      'आपका योगदान स्थानीय कार्यक्रमों, स्वयंसेवक समन्वय, जनजागरण और सामाजिक पहलों को आगे बढ़ाता है।',
    impactEyebrow: 'प्रभाव मार्गदर्शिका',
    impactTitle: 'योगदान कहाँ तुरंत सहायक होता है',
    impactPoints: [
      { title: 'स्वयंसेवक सक्रियता', amount: 500 },
      { title: 'सामुदायिक कार्यक्रम सहायता', amount: 1000 },
      { title: 'संपर्क सामग्री और लॉजिस्टिक्स', amount: 5000 },
    ],
    transparencyTitle: 'पारदर्शिता नोट',
    transparencyDescription:
      'गैर-गोपनीय दान केवल एडमिन द्वारा भुगतान प्रमाण सत्यापित होने के बाद ही सार्वजनिक दाता पृष्ठ पर दिखना चाहिए। यदि आप गोपनीयता चाहते हैं तो फॉर्म जमा करने से पहले विकल्प चुनें।',
    viewDonors: 'सार्वजनिक दाता देखें',
  },
} as const;

export default function DonatePage() {
  const language = getLanguageFromCookiesStore(cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const qrConfig = getDonationQrConfig();

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content grid gap-8 pb-16 lg:grid-cols-[1.15fr_0.85fr]">
        <DonateForm
          qrImageUrl={qrConfig.imageUrl}
          qrTitle={qrConfig.title}
          qrNote={qrConfig.note}
          qrConfigured={qrConfig.isConfigured}
        />

        <div className="space-y-6">
          <section className="surface-panel px-6 py-6">
            <span className="eyebrow">{text.impactEyebrow}</span>
            <h2 className="section-title mt-4">{text.impactTitle}</h2>
            <div className="mt-6 space-y-4">
              {text.impactPoints.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-stone-temple bg-stone-temple/35 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-brown-dark">{item.title}</p>
                    <span className="text-sm font-semibold text-saffron">
                      {formatIndianCurrency(item.amount, locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel px-6 py-6">
            <h2 className="text-2xl font-semibold text-brown-dark">{text.transparencyTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-brown-dark/75">{text.transparencyDescription}</p>
            <Link href="/donors" className="mt-5 inline-flex text-sm font-semibold text-saffron">
              {text.viewDonors}
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
