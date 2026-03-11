import { cookies } from 'next/headers';
import ContactForm from '@/components/forms/ContactForm';
import PageHero from '@/components/shared/PageHero';
import { getLanguageFromCookiesStore, pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    eyebrow: 'Contact',
    title: 'Reach the organisation for support, coordination, or public queries',
    description:
      'Use the contact form for local coordination, volunteer questions, event enquiries, or organisational communication.',
    desk: 'Contact Desk',
    help: 'Let us know how we can help',
    cards: [
      { label: 'Email', value: 'contact@hindusurakshasangh.org' },
      { label: 'Phone', value: '+91 98765 43210' },
      { label: 'Service Area', value: 'Coordinated support across India' },
    ],
    map: 'Location Map',
    mapHelp: "Update this embed with the organisation's exact office location when it is available.",
    mapTitle: 'Organisation location map',
  },
  hi: {
    eyebrow: 'संपर्क',
    title: 'सहायता, समन्वय या सार्वजनिक पूछताछ के लिए संगठन से संपर्क करें',
    description:
      'स्थानीय समन्वय, स्वयंसेवक प्रश्न, कार्यक्रम संबंधी जानकारी या संगठनात्मक संवाद के लिए संपर्क फॉर्म का उपयोग करें।',
    desk: 'संपर्क डेस्क',
    help: 'हमें बताइए हम कैसे मदद कर सकते हैं',
    cards: [
      { label: 'ईमेल', value: 'contact@hindusurakshasangh.org' },
      { label: 'फोन', value: '+91 98765 43210' },
      { label: 'सेवा क्षेत्र', value: 'भारतभर में समन्वित सहयोग' },
    ],
    map: 'स्थान मानचित्र',
    mapHelp: 'जब उपलब्ध हो, संगठन के वास्तविक कार्यालय स्थान से इस एम्बेड को अपडेट करें।',
    mapTitle: 'संगठन का स्थान मानचित्र',
  },
  mr: {
    eyebrow: 'संपर्क',
    title: 'सहाय्य, समन्वय किंवा सार्वजनिक चौकशीसाठी संघटनेशी संपर्क साधा',
    description:
      'स्थानिक समन्वय, स्वयंसेवकांचे प्रश्न, कार्यक्रमविषयक माहिती किंवा संघटनात्मक संवादासाठी संपर्क फॉर्म वापरा.',
    desk: 'संपर्क कक्ष',
    help: 'आम्ही कशी मदत करू शकतो ते सांगा',
    cards: [
      { label: 'ईमेल', value: 'contact@hindusurakshasangh.org' },
      { label: 'फोन', value: '+91 98765 43210' },
      { label: 'सेवा क्षेत्र', value: 'भारतभर समन्वित सहाय्य' },
    ],
    map: 'स्थान नकाशा',
    mapHelp: 'उपलब्ध झाल्यावर संघटनेच्या अचूक कार्यालयीन पत्त्यासह हा एम्बेड अपडेट करा.',
    mapTitle: 'संघटनेचा स्थान नकाशा',
  },
} as const;

const mapEmbedUrl = 'https://www.google.com/maps?q=India&output=embed';

export default async function ContactPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);

  return (
    <>
      <PageHero
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />

      <div className="page-content grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="surface-panel px-6 py-6">
            <span className="eyebrow">{text.desk}</span>
            <h2 className="section-title mt-4">{text.help}</h2>
            <div className="mt-6 space-y-4">
              {text.cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-stone-temple bg-stone-temple/35 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-saffron">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold text-brown-dark">{card.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="border-b border-stone-temple px-6 py-5">
              <h2 className="text-2xl font-semibold text-brown-dark">{text.map}</h2>
              <p className="mt-2 text-sm text-brown-dark/65">{text.mapHelp}</p>
            </div>
            <iframe
              title={text.mapTitle}
              src={mapEmbedUrl}
              className="h-[340px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        </div>

        <ContactForm />
      </div>
    </>
  );
}
