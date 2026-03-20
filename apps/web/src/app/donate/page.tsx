import { cookies } from 'next/headers';
import Link from 'next/link';
import type { DonationCause } from '@hss/domain';
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
      { title: 'Volunteer mobilisation', amount: 500 },
      { title: 'Community event support', amount: 1000 },
      { title: 'Outreach material and logistics', amount: 5000 },
    ],
    transparencyTitle: 'Transparency note',
    transparencyDescription:
      'Non-anonymous donations should only appear on the public donors page after the admin verifies the uploaded payment proof. If you prefer privacy, enable the anonymous option before submitting the form.',
    viewDonors: 'View public donors',
    causes: {
      temple: {
        title: 'Temple support',
        description: 'Support temple upkeep, repairs, and devotional activity arrangements.',
      },
      event: {
        title: 'Event support',
        description: 'Support travel, planning, awareness events, and volunteer mobilisation.',
      },
      bhandara: {
        title: 'Bhandhara support',
        description: 'Support food seva, cooking arrangements, and public distribution efforts.',
      },
      children: {
        title: 'Children support',
        description: 'Support welfare, educational aid, and child-focused service campaigns.',
      },
    },
  },
  hi: {
    eyebrow: 'मिशन का समर्थन करें',
    title: 'सेवा, जनसंपर्क और समाज कार्य के लिए सहयोग दें',
    description:
      'आपका योगदान स्थानीय कार्यक्रमों, स्वयंसेवक समन्वय, जनजागरण और सामाजिक पहलों को आगे बढ़ाने में सहायक है।',
    impactEyebrow: 'प्रभाव मार्गदर्शिका',
    impactTitle: 'आपका योगदान कहाँ तुरंत सहायक होता है',
    impactPoints: [
      { title: 'स्वयंसेवक सक्रियता', amount: 500 },
      { title: 'सामुदायिक कार्यक्रम सहायता', amount: 1000 },
      { title: 'जनसंपर्क सामग्री और लॉजिस्टिक्स', amount: 5000 },
    ],
    transparencyTitle: 'पारदर्शिता नोट',
    transparencyDescription:
      'गैर-गोपनीय दान केवल एडमिन द्वारा भुगतान प्रमाण सत्यापित होने के बाद ही सार्वजनिक दाता पृष्ठ पर दिखना चाहिए। यदि आप गोपनीयता चाहते हैं तो फॉर्म जमा करने से पहले विकल्प चुनें।',
    viewDonors: 'सार्वजनिक दाता देखें',
    causes: {
      temple: {
        title: 'मंदिर सहायता',
        description: 'मंदिर व्यवस्था, मरम्मत और धार्मिक कार्यक्रमों में सहयोग।',
      },
      event: {
        title: 'कार्यक्रम सहायता',
        description: 'यात्रा, आयोजन, जनजागरण कार्यक्रम और स्वयंसेवक समन्वय में सहयोग।',
      },
      bhandara: {
        title: 'भंडारा सहायता',
        description: 'अन्न सेवा, भोजन व्यवस्था और वितरण कार्यों में सहयोग।',
      },
      children: {
        title: 'बच्चों के लिए सहायता',
        description: 'बच्चों के कल्याण, शिक्षा सहायता और सेवा अभियानों में सहयोग।',
      },
    },
  },
  mr: {
    eyebrow: 'मिशनला पाठिंबा द्या',
    title: 'सेवा, जनसंपर्क आणि समाजकार्यासाठी बळ द्या',
    description:
      'आपले योगदान स्थानिक कार्यक्रम, स्वयंसेवक समन्वय, जनजागृती आणि सामाजिक उपक्रमांना थेट मदत करते.',
    impactEyebrow: 'प्रभाव मार्गदर्शिका',
    impactTitle: 'आपले योगदान कुठे त्वरित उपयोगी पडते',
    impactPoints: [
      { title: 'स्वयंसेवक सक्रियता', amount: 500 },
      { title: 'समुदाय कार्यक्रम सहाय्य', amount: 1000 },
      { title: 'जनसंपर्क साहित्य आणि लॉजिस्टिक्स', amount: 5000 },
    ],
    transparencyTitle: 'पारदर्शकता नोंद',
    transparencyDescription:
      'गोपनीय नसलेली देणगी फक्त अॅडमिनने पेमेंट पुरावा पडताळल्यानंतरच सार्वजनिक दाता पृष्ठावर दिसेल. गोपनीयता हवी असल्यास फॉर्म भरण्यापूर्वी पर्याय निवडा.',
    viewDonors: 'सार्वजनिक दाते पहा',
    causes: {
      temple: {
        title: 'मंदिर सहाय्य',
        description: 'मंदिर व्यवस्था, दुरुस्ती आणि धार्मिक कार्यक्रमांसाठी मदत.',
      },
      event: {
        title: 'कार्यक्रम सहाय्य',
        description: 'प्रवास, नियोजन, जनजागृती कार्यक्रम आणि स्वयंसेवक व्यवस्थेसाठी मदत.',
      },
      bhandara: {
        title: 'भंडारा सहाय्य',
        description: 'अन्नसेवा, स्वयंपाक व्यवस्था आणि वितरण उपक्रमांसाठी मदत.',
      },
      children: {
        title: 'मुलांसाठी सहाय्य',
        description: 'मुलांच्या कल्याण, शिक्षण सहाय्य आणि सेवा मोहिमांसाठी मदत.',
      },
    },
  },
} as const;

function normalizeCause(value?: string | string[]): DonationCause | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'temple' || raw === 'event' || raw === 'bhandara' || raw === 'children'
    ? raw
    : undefined;
}

export default async function DonatePage({
  searchParams,
}: {
  searchParams?: Promise<{ cause?: string | string[] }>;
}) {
  const language = getLanguageFromCookiesStore(await cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const qrConfig = getDonationQrConfig();
  const params = (await searchParams) || {};
  const selectedCause = normalizeCause(params.cause);
  const selectedCauseDetails = selectedCause ? text.causes[selectedCause] : undefined;

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="page-content pb-16">
        {selectedCauseDetails ? (
          <section className="surface-panel mb-8 px-6 py-6">
            <span className="eyebrow">{text.eyebrow}</span>
            <h2 className="mt-4 text-2xl font-semibold text-brown-dark sm:text-3xl">
              {selectedCauseDetails.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brown-dark/75 sm:text-base">
              {selectedCauseDetails.description}
            </p>
          </section>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <DonateForm
            qrImageUrl={qrConfig.imageUrl}
            qrTitle={qrConfig.title}
            qrNote={qrConfig.note}
            qrConfigured={qrConfig.isConfigured}
            selectedCause={selectedCause}
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
      </div>
    </>
  );
}
