import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import AdminUserDeleteButton from '@/components/admin/AdminUserDeleteButton';
import { formatDisplayDate } from '@/lib/format';
import { getIntlLocale, getLanguageFromCookiesStore, getRoleLabel, pickLanguage } from '@/lib/i18n';
import { getAdminUsersData } from '@/lib/services/admin-dashboard';

const copy = {
  en: {
    title: 'User accounts',
    description: 'Review the current user list and identify role assignments across the system.',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    approved: 'Approved',
    created: 'Created',
    actions: 'Actions',
    current: 'Current session',
    noData: 'No users found.',
    yes: 'Yes',
    no: 'No',
  },
  hi: {
    title: '?????????? ????',
    description: '?????? ??? ??????? ???????????? ?? ???? ???????? ?? ??????? ?????',
    name: '???',
    email: '????',
    role: '??????',
    approved: '???????',
    created: '???????',
    actions: '????????',
    current: '??????? ????',
    noData: '??? ?????????? ???? ?????',
    yes: '???',
    no: '????',
  },
} as const;

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const language = getLanguageFromCookiesStore(cookies());
  const locale = getIntlLocale(language);
  const text = pickLanguage(language, copy);
  const users = await getAdminUsersData();

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      {users.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-temple text-left text-brown-dark/70">
                <th className="px-3 py-3">{text.name}</th>
                <th className="px-3 py-3">{text.email}</th>
                <th className="px-3 py-3">{text.role}</th>
                <th className="px-3 py-3">{text.approved}</th>
                <th className="px-3 py-3">{text.created}</th>
                <th className="px-3 py-3">{text.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-temple/60">
                  <td className="px-3 py-4 font-semibold text-brown-dark">{user.name}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{user.email}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{getRoleLabel(user.role, language)}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{user.isApproved ? text.yes : text.no}</td>
                  <td className="px-3 py-4 text-brown-dark/70">{formatDisplayDate(user.createdAt, undefined, locale)}</td>
                  <td className="px-3 py-4 text-brown-dark/70">
                    {currentUserId && currentUserId === user.id ? (
                      <span className="text-xs font-semibold text-brown-dark/60">{text.current}</span>
                    ) : (
                      <AdminUserDeleteButton userId={user.id} userName={user.name} />
                    )}
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
