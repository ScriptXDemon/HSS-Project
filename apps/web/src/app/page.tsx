import { cookies } from 'next/headers';
import FeaturedPeopleSection from '@/components/home/FeaturedPeopleSection';
import HomeBannerCarousel from '@/components/home/HomeBannerCarousel';
import MissionSection from '@/components/home/MissionSection';
import QuickLinksSection from '@/components/home/QuickLinksSection';
import DonationCauseSection from '@/components/home/DonationCauseSection';
import { getLanguageFromCookiesStore } from '@/lib/i18n';
import { getAboutPageContent, getHomePageContent } from '@/lib/services/public-content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const language = getLanguageFromCookiesStore(await cookies());
  const [homeContent, aboutContent] = await Promise.all([
    getHomePageContent(language),
    getAboutPageContent(language),
  ]);

  return (
    <>
      <HomeBannerCarousel banners={homeContent.banners} />
      <MissionSection content={aboutContent.content} />
      <FeaturedPeopleSection
        eyebrow={aboutContent.content.leadershipEyebrow}
        title={aboutContent.content.leadershipTitle}
        people={homeContent.featuredPeople}
      />
      <QuickLinksSection />
      <DonationCauseSection language={language} />
    </>
  );
}
