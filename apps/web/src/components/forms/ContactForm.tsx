'use client';

import { useMemo, useState, useTransition } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

type FieldErrors = Record<string, string[] | undefined>;

const copy = {
  en: {
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    subject: 'Subject',
    message: 'Message',
    namePlaceholder: 'Your full name',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    subjectPlaceholder: 'How can we help?',
    messagePlaceholder: 'Tell us how we can support your query, event, or local initiative.',
    error: 'Unable to send your message',
    success: 'Your message has been sent. Our team will get back to you soon.',
    sending: 'Sending...',
    send: 'Send Message',
  },
  hi: {
    name: 'पूरा नाम',
    email: 'ईमेल पता',
    phone: 'फोन नंबर',
    subject: 'विषय',
    message: 'संदेश',
    namePlaceholder: 'आपका पूरा नाम',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    subjectPlaceholder: 'हम कैसे मदद करें?',
    messagePlaceholder: 'बताइए कि आपकी पूछताछ, कार्यक्रम या स्थानीय पहल में हम कैसे सहयोग कर सकते हैं।',
    error: 'आपका संदेश भेजा नहीं जा सका',
    success: 'आपका संदेश भेज दिया गया है। हमारी टीम शीघ्र संपर्क करेगी।',
    sending: 'भेजा जा रहा है...',
    send: 'संदेश भेजें',
  },
  mr: {
    name: 'पूर्ण नाव',
    email: 'ईमेल पत्ता',
    phone: 'फोन नंबर',
    subject: 'विषय',
    message: 'संदेश',
    namePlaceholder: 'आपले पूर्ण नाव',
    emailPlaceholder: 'name@example.com',
    phonePlaceholder: '9876543210',
    subjectPlaceholder: 'आम्ही कशी मदत करू?',
    messagePlaceholder: 'आपल्या चौकशी, कार्यक्रम किंवा स्थानिक उपक्रमासाठी आम्ही कशी मदत करू शकतो ते सांगा.',
    error: 'आपला संदेश पाठवता आला नाही',
    success: 'आपला संदेश पाठवला गेला आहे. आमची टीम लवकरच संपर्क करेल.',
    sending: 'पाठवले जात आहे...',
    send: 'संदेश पाठवा',
  },
} as const;

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);

  function getFieldError(key: string) {
    return fieldErrors[key]?.[0];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || text.error);
        setFieldErrors(result.details || {});
        return;
      }

      form.reset();
      setMessage(text.success);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            {text.name}
          </label>
          <input id="name" name="name" className="input-field" placeholder={text.namePlaceholder} />
          {getFieldError('name') ? <p className="error-text">{getFieldError('name')}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            {text.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field"
            placeholder={text.emailPlaceholder}
          />
          {getFieldError('email') ? <p className="error-text">{getFieldError('email')}</p> : null}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            {text.phone}
          </label>
          <input id="phone" name="phone" className="input-field" placeholder={text.phonePlaceholder} />
          {getFieldError('phone') ? <p className="error-text">{getFieldError('phone')}</p> : null}
        </div>
        <div>
          <label htmlFor="subject" className="field-label">
            {text.subject}
          </label>
          <input
            id="subject"
            name="subject"
            className="input-field"
            placeholder={text.subjectPlaceholder}
          />
          {getFieldError('subject') ? <p className="error-text">{getFieldError('subject')}</p> : null}
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="message" className="field-label">
          {text.message}
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea-field"
          placeholder={text.messagePlaceholder}
        />
        {getFieldError('message') ? <p className="error-text">{getFieldError('message')}</p> : null}
      </div>

      {error ? <p className="mt-4 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? text.sending : text.send}
      </button>
    </form>
  );
}
