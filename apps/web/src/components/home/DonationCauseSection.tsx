import Link from 'next/link';
import type { DonationCause } from '@hss/domain';
import type { Language } from '@/lib/i18n';
import { pickLanguage } from '@/lib/i18n';

interface DonationCauseSectionProps {
  language: Language;
}

const copy = {
  en: {
    eyebrow: 'Support a Cause',
    title: 'Choose the seva work you want to strengthen',
    description:
      'Each cause card opens the donate page with the selected purpose already filled so that the donation intent is clear during review.',
    causes: {
      temple: {
        title: 'Donate for Temple',
        description: 'Support temple upkeep, religious programmes, and sacred-space maintenance.',
      },
      event: {
        title: 'Donate for Event',
        description: 'Help organise public gatherings, awareness events, and volunteer logistics.',
      },
      bhandara: {
        title: 'Donate for Bhandhara',
        description: 'Contribute toward food seva, community kitchens, and large devotional meals.',
      },
      children: {
        title: 'Donate for Children',
        description: 'Back education, care, and welfare drives focused on children and families.',
      },
    },
    cta: 'Open donation form',
  },
  hi: {
    eyebrow: 'एक उद्देश्य चुनें',
    title: 'जिस सेवा कार्य को मजबूत करना चाहते हैं, उसे चुनें',
    description:
      'हर कार्ड आपको दान पृष्ठ पर ले जाएगा, जहाँ उद्देश्य पहले से भरा रहेगा ताकि एडमिन सत्यापन के समय दान का कारण स्पष्ट हो।',
    causes: {
      temple: {
        title: 'मंदिर हेतु दान',
        description: 'मंदिर व्यवस्था, धार्मिक कार्यक्रम और पवित्र स्थलों के रखरखाव में सहयोग करें।',
      },
      event: {
        title: 'कार्यक्रम हेतु दान',
        description: 'सार्वजनिक कार्यक्रम, जागरूकता आयोजन और स्वयंसेवक व्यवस्था में सहयोग करें।',
      },
      bhandara: {
        title: 'भंडारा हेतु दान',
        description: 'अन्न सेवा, सामुदायिक रसोई और धार्मिक भोजन वितरण में सहयोग दें।',
      },
      children: {
        title: 'बच्चों हेतु दान',
        description: 'बच्चों की शिक्षा, सहायता और कल्याणकारी अभियानों को समर्थन दें।',
      },
    },
    cta: 'दान फॉर्म खोलें',
  },
  mr: {
    eyebrow: 'एक कारण निवडा',
    title: 'ज्या सेवा उपक्रमाला बळ द्यायचे आहे तो निवडा',
    description:
      'प्रत्येक कार्ड दान पृष्ठ उघडेल आणि उद्देश आधीच भरलेला असेल, त्यामुळे पडताळणीच्या वेळी दानाचा हेतू स्पष्ट राहील.',
    causes: {
      temple: {
        title: 'मंदिरासाठी दान',
        description: 'मंदिर व्यवस्था, धार्मिक कार्यक्रम आणि पवित्र स्थळांच्या देखभालीसाठी मदत करा.',
      },
      event: {
        title: 'कार्यक्रमासाठी दान',
        description: 'सार्वजनिक कार्यक्रम, जनजागृती उपक्रम आणि स्वयंसेवक व्यवस्थेसाठी मदत करा.',
      },
      bhandara: {
        title: 'भंडाऱ्यासाठी दान',
        description: 'अन्नसेवा, सामुदायिक स्वयंपाक आणि मोठ्या धार्मिक भोजनसेवेसाठी योगदान द्या.',
      },
      children: {
        title: 'मुलांसाठी दान',
        description: 'मुलांच्या शिक्षण, काळजी आणि कल्याण उपक्रमांना पाठिंबा द्या.',
      },
    },
    cta: 'दान फॉर्म उघडा',
  },
} as const;

const causeKeys: DonationCause[] = ['temple', 'event', 'bhandara', 'children'];

const toneClasses: Record<DonationCause, string> = {
  temple: 'from-saffron/15 to-white',
  event: 'from-sacred-red/10 to-white',
  bhandara: 'from-gold-temple/20 to-white',
  children: 'from-maroon-deep/10 to-white',
};

export default function DonationCauseSection({ language }: DonationCauseSectionProps) {
  const text = pickLanguage(language, copy);

  return (
    <section className="section-padding bg-stone-temple/35">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="eyebrow">{text.eyebrow}</span>
          <h2 className="section-title mt-4">{text.title}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-brown-dark/70">
            {text.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {causeKeys.map((cause) => (
            <article
              key={cause}
              className={`rounded-[1.75rem] border border-stone-temple bg-gradient-to-br p-6 shadow-lg shadow-saffron/5 ${toneClasses[cause]}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{text.eyebrow}</p>
              <h3 className="mt-4 text-2xl font-semibold text-brown-dark">{text.causes[cause].title}</h3>
              <p className="mt-4 text-sm leading-7 text-brown-dark/70">{text.causes[cause].description}</p>
              <Link href={`/donate?cause=${cause}`} className="mt-6 inline-flex text-sm font-semibold text-saffron">
                {text.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
