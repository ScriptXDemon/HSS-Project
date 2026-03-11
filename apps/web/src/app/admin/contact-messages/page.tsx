import { cookies } from 'next/headers';
import ContactMessageActions from '@/components/admin/ContactMessageActions';
import { formatDisplayDateTime } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, getStatusLabel, pickLanguage } from '@/lib/i18n';
import { getAdminContactMessagesData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Contact inbox',
    description: 'Monitor public messages and mark them as reviewed once handled.',
    sender: 'Sender',
    subject: 'Subject',
    message: 'Message',
    status: 'Status',
    received: 'Received',
    actions: 'Actions',
    noData: 'No contact messages found.',
  },
  hi: {
    title: 'संपर्क इनबॉक्स',
    description: 'सार्वजनिक संदेशों की निगरानी करें और निपटान के बाद उन्हें पढ़ा हुआ चिन्हित करें।',
    sender: 'प्रेषक',
    subject: 'विषय',
    message: 'संदेश',
    status: 'स्थिति',
    received: 'प्राप्त',
    actions: 'कार्य',
    noData: 'कोई संपर्क संदेश नहीं मिला।',
  },
  mr: {
    title: 'संपर्क इनबॉक्स',
    description: 'सार्वजनिक संदेशांचे निरीक्षण करा आणि हाताळणीनंतर त्यांना वाचलेले चिन्हांकित करा.',
    sender: 'प्रेषक',
    subject: 'विषय',
    message: 'संदेश',
    status: 'स्थिती',
    received: 'प्राप्त',
    actions: 'क्रिया',
    noData: 'कोणतेही संपर्क संदेश सापडले नाहीत.',
  },
} as const;

export default async function AdminContactMessagesPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const messages = await getAdminContactMessagesData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {messages.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                <th className="px-3 py-3">{text.sender}</th>
                <th className="px-3 py-3">{text.subject}</th>
                <th className="px-3 py-3">{text.message}</th>
                <th className="px-3 py-3">{text.status}</th>
                <th className="px-3 py-3">{text.received}</th>
                <th className="px-3 py-3">{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className="border-b border-stone-temple/60 align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-brown-dark">{message.name}</p>
                    <p className="mt-1 text-brown-dark/65">{message.email}</p>
                    {message.phone ? <p className="text-brown-dark/65">{message.phone}</p> : null}
                  </td>
                  <td className="px-3 py-4 text-brown-dark/75">{message.subject}</td>
                  <td className="px-3 py-4 text-brown-dark/75 max-w-sm">{message.message}</td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron">
                      {getStatusLabel(message.isRead ? 'READ' : 'UNREAD', language)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDateTime(message.createdAt, locale)}</td>
                  <td className="px-3 py-4">
                    <ContactMessageActions messageId={message.id} disabled={message.isRead} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-brown-dark/70">{text.noData}</p>
      )}
    </section>
  );
}
