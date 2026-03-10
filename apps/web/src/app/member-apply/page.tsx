import { cookies } from 'next/headers';
import MemberApplicationForm from '@/components/forms/MemberApplicationForm';
import PageHero from '@/components/shared/PageHero';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    eyebrow: 'Join the Organisation',
    title: 'Create your account and submit your membership application',
    description:
      'This single form creates your login credentials and stores your membership application for approval. Once submitted, your account can be used immediately while the application remains pending.',
    next: 'What Happens Next',
    workflow: 'Membership review workflow',
    steps: [
      'Create your member account and submit the required profile details.',
      'The admin team reviews the application and verifies the submitted information.',
      'Approved members gain access to future dashboard features and ID card services.',
    ],
    benefits: 'Member Benefits',
    benefitItems: [
      'Receive direct updates on local initiatives and upcoming events.',
      'Access your login-protected account and future member dashboard.',
      'Become eligible for approval-based ID card generation and member services.',
    ],
  },
  hi: {
    eyebrow: 'संगठन से जुड़ें',
    title: 'अपना खाता बनाएं और सदस्यता आवेदन जमा करें',
    description:
      'यह एकल फॉर्म आपका लॉगिन खाता भी बनाता है और सदस्यता आवेदन को अनुमोदन के लिए सुरक्षित रखता है। आवेदन के बाद आपका खाता तुरंत उपयोग किया जा सकता है जबकि सदस्यता लंबित रहती है।',
    next: 'आगे क्या होगा',
    workflow: 'सदस्यता समीक्षा प्रक्रिया',
    steps: [
      'अपना सदस्य खाता बनाएं और आवश्यक विवरण जमा करें।',
      'एडमिन टीम आवेदन की समीक्षा करती है और दी गई जानकारी का सत्यापन करती है।',
      'स्वीकृत सदस्यों को भविष्य की डैशबोर्ड सुविधाओं और आईडी कार्ड सेवाओं तक पहुँच मिलती है।',
    ],
    benefits: 'सदस्य लाभ',
    benefitItems: [
      'स्थानीय पहलों और आगामी कार्यक्रमों की सीधी जानकारी प्राप्त करें।',
      'अपने सुरक्षित खाते और भविष्य के सदस्य डैशबोर्ड तक पहुँच पाएँ।',
      'अनुमोदन के बाद आईडी कार्ड और सदस्य सेवाओं के लिए पात्र बनें।',
    ],
  },
} as const;

export default function MemberApplyPage() {
  const language = getLanguageFromCookiesStore(cookies());
  const text = pickLanguage(language, copy);

  return (
    <>
      <PageHero
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />

      <div className="page-content grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-panel px-6 py-7">
          <span className="eyebrow">{text.next}</span>
          <h2 className="section-title mt-4">{text.workflow}</h2>
          <ol className="mt-6 space-y-4 text-sm leading-7 text-brown-dark/75">
            {text.steps.map((step) => (
              <li key={step} className="rounded-2xl border border-stone-temple bg-stone-temple/35 px-4 py-4">
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-3xl bg-gradient-to-br from-brown-dark to-maroon-deep px-5 py-6 text-white">
            <h3 className="text-xl font-semibold">{text.benefits}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {text.benefitItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gold-temple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <MemberApplicationForm />
      </div>
    </>
  );
}
