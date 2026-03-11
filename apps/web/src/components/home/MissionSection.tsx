'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Our Mission',
    description:
      'Hindu Suraksha Sangh is committed to safeguarding Hindu dharma and serving the community through dedicated efforts.',
    missions: [
      {
        icon: 'Culture',
        title: 'Cultural Preservation',
        description:
          'Protecting and promoting the rich heritage of Hindu culture, traditions, and values for future generations.',
      },
      {
        icon: 'Seva',
        title: 'Community Service',
        description:
          'Organizing welfare programs, health camps, and educational initiatives for the community.',
      },
      {
        icon: 'Youth',
        title: 'Youth Empowerment',
        description:
          'Empowering the youth through training programs, workshops, and leadership development.',
      },
      {
        icon: 'Temple',
        title: 'Temple Protection',
        description:
          'Working towards the protection and restoration of temples and sacred sites across the state.',
      },
    ],
  },
  hi: {
    title: 'हमारा मिशन',
    description:
      'हिंदू सुरक्षा संघ हिंदू धर्म की रक्षा और समाज सेवा के लिए समर्पित है।',
    missions: [
      {
        icon: 'संस्कृति',
        title: 'संस्कृति संरक्षण',
        description:
          'आने वाली पीढ़ियों के लिए हिंदू संस्कृति, परंपराओं और मूल्यों की समृद्ध विरासत का संरक्षण और प्रसार।',
      },
      {
        icon: 'सेवा',
        title: 'समाज सेवा',
        description:
          'समाज के लिए कल्याणकारी कार्यक्रम, स्वास्थ्य शिविर और शैक्षिक पहल का आयोजन।',
      },
      {
        icon: 'युवा',
        title: 'युवा सशक्तिकरण',
        description:
          'प्रशिक्षण, कार्यशालाओं और नेतृत्व विकास के माध्यम से युवाओं को सशक्त बनाना।',
      },
      {
        icon: 'मंदिर',
        title: 'मंदिर संरक्षण',
        description:
          'राज्यभर के मंदिरों और पवित्र स्थलों के संरक्षण और पुनर्स्थापन के लिए कार्य।',
      },
    ],
  },
  mr: {
    title: 'आपले ध्येय',
    description:
      'हिंदू सुरक्षा संघ हिंदू धर्मरक्षण आणि समाजसेवेसाठी समर्पित आहे.',
    missions: [
      {
        icon: 'संस्कृती',
        title: 'संस्कृती संरक्षण',
        description:
          'भावी पिढ्यांसाठी हिंदू संस्कृती, परंपरा आणि मूल्यांचा समृद्ध वारसा जपणे आणि प्रसारित करणे.',
      },
      {
        icon: 'सेवा',
        title: 'समाजसेवा',
        description:
          'समाजासाठी कल्याणकारी कार्यक्रम, आरोग्य शिबिरे आणि शैक्षणिक उपक्रमांचे आयोजन.',
      },
      {
        icon: 'युवा',
        title: 'युवा सक्षमीकरण',
        description:
          'प्रशिक्षण, कार्यशाळा आणि नेतृत्व विकासाद्वारे युवांना सक्षम करणे.',
      },
      {
        icon: 'मंदिर',
        title: 'मंदिर संरक्षण',
        description:
          'राज्यभरातील मंदिरे आणि पवित्र स्थळांच्या संरक्षण व पुनर्स्थापनेसाठी कार्य करणे.',
      },
    ],
  },
} as const;

export default function MissionSection() {
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  return (
    <section className="section-padding bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl text-brown-dark mb-4">{text.title}</h2>
          <div className="w-24 h-1 bg-saffron mx-auto rounded-full mb-4" />
          <p className="text-brown-dark/70 max-w-2xl mx-auto">{text.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {text.missions.map((item) => (
            <div
              key={item.title}
              className="card p-6 text-center hover:shadow-lg transition-shadow group"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-heading text-lg text-brown-dark mb-2">{item.title}</h3>
              <p className="text-sm text-brown-dark/70 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
