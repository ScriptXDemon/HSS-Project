import AdminAboutUsManager from '@/components/admin/AdminAboutUsManager';
import { getAdminAboutContentData } from '@/lib/services/admin-dashboard';

export default async function AdminAboutUsPage() {
  const data = await getAdminAboutContentData();
  return <AdminAboutUsManager about={data.about} people={data.people} />;
}
