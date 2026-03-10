import HeroSection from '@/components/home/HeroSection';
import MissionSection from '@/components/home/MissionSection';
import QuickLinksSection from '@/components/home/QuickLinksSection';
import DonateCallout from '@/components/home/DonateCallout';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <QuickLinksSection />
      <DonateCallout />
    </>
  );
}
