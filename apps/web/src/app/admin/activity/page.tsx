import AdminActivityManager from '@/components/admin/AdminActivityManager';
import { getAdminActivityData } from '@/lib/services/admin-dashboard';

export default async function AdminActivityPage() {
  const activities = await getAdminActivityData();
  return <AdminActivityManager activities={activities} />;
}
