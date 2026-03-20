import AdminBannerManager from '@/components/admin/AdminBannerManager';
import { getAdminBannersData } from '@/lib/services/admin-dashboard';

export default async function AdminBannersPage() {
  const banners = await getAdminBannersData();
  return <AdminBannerManager banners={banners} />;
}
