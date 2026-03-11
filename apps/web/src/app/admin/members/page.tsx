import { cookies } from 'next/headers';
import MemberStatusActions from '@/components/admin/MemberStatusActions';
import { formatDisplayDate } from '@/lib/format';
import {
  getIntlLocale,
  getLanguageFromCookiesStore,
  getStatusLabel,
  pickLanguage,
} from '@/lib/i18n';
import { getAdminMembersData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'Member management',
    description: 'Review member applications, update approval status, and generate member IDs.',
    member: 'Member',
    phone: 'Phone',
    location: 'Location',
    applied: 'Applied',
    idCard: 'ID Card',
    status: 'Status',
    actions: 'Actions',
    noData: 'No member records found.',
  },
  hi: {
    title: 'सदस्य प्रबंधन',
    description: 'सदस्य आवेदन देखें, स्थिति बदलें और सदस्य आईडी तैयार करें।',
    member: 'सदस्य',
    phone: 'फोन',
    location: 'स्थान',
    applied: 'आवेदन तिथि',
    idCard: 'आईडी कार्ड',
    status: 'स्थिति',
    actions: 'कार्य',
    noData: 'कोई सदस्य रिकॉर्ड नहीं मिला।',
  },
  mr: {
    title: 'सदस्य व्यवस्थापन',
    description: 'सदस्य अर्ज पाहा, स्थिती बदला आणि सदस्य आयडी तयार करा.',
    member: 'सदस्य',
    phone: 'फोन',
    location: 'स्थान',
    applied: 'अर्ज दिनांक',
    idCard: 'ओळखपत्र',
    status: 'स्थिती',
    actions: 'क्रिया',
    noData: 'कोणतीही सदस्य नोंद सापडली नाही.',
  },
} as const;

export default async function AdminMembersPage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const members = await getAdminMembersData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {members.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                <th className="px-3 py-3">{text.member}</th>
                <th className="px-3 py-3">{text.phone}</th>
                <th className="px-3 py-3">{text.location}</th>
                <th className="px-3 py-3">{text.applied}</th>
                <th className="px-3 py-3">{text.idCard}</th>
                <th className="px-3 py-3">{text.status}</th>
                <th className="px-3 py-3">{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-stone-temple/60 align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-brown-dark">{member.fullName}</p>
                    <p className="mt-1 text-brown-dark/65">{member.user?.email || member.userId}</p>
                  </td>
                  <td className="px-3 py-4 text-brown-dark/70">{member.user?.phone || '-'}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{member.district}, {member.state}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDate(member.createdAt, undefined, locale)}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{member.idCardNumber || '-'}</td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron">
                      {getStatusLabel(member.status, language)}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <MemberStatusActions memberId={member.id} />
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
