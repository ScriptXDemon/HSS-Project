import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { auth } from '@/lib/auth';
import { formatTemplate, getLanguageFromCookiesStore, getRoleLabel, pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    welcome: 'Admin access',
    role: 'Signed in as {name} ({role})',
    breadcrumb: 'Control Panel',
  },
  hi: {
    welcome: 'एडमिन एक्सेस',
    role: '{name} ({role}) के रूप में लॉगिन',
    breadcrumb: 'कंट्रोल पैनल',
  },
  mr: {
    welcome: 'अॅडमिन प्रवेश',
    role: '{name} ({role}) म्हणून लॉगिन',
    breadcrumb: 'नियंत्रण पॅनेल',
  },
} as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    redirect('/login?callbackUrl=/admin');
  }

  const language = getLanguageFromCookiesStore(await cookies());
  const text = pickLanguage(language, copy);
  const roleLabel = getRoleLabel(role, language);
  const userName = session.user.name || 'Admin';

  return (
    <section className="page-shell">
      <div className="page-content pb-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AdminSidebar userName={userName} />
          </div>

          <div className="space-y-6">
            <div className="surface-panel px-6 py-5">
              <p className="eyebrow">{text.breadcrumb}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="section-title">{text.welcome}</h1>
                  <p className="mt-2 text-sm text-brown-dark/70">
                    {formatTemplate(text.role, { name: userName, role: roleLabel })}
                  </p>
                </div>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
