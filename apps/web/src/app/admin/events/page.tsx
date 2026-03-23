import AdminEventsManager from '@/components/admin/AdminEventsManager';
import { getAdminEventsData } from '@/lib/services/admin-dashboard';

export default async function AdminEventsPage() {
  const events = await getAdminEventsData();
  return <AdminEventsManager events={events} />;
}
