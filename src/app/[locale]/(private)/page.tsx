import Greeting from './greeting';
import { AnnouncementsCard, SupportCard } from './cards';
import { DashboardMetrics } from './components/dashboard-metrics';
import { DashboardCharts } from './components/dashboard-charts';

export default function Home() {
  return (
    <div className="flex flex-col gap-[20px]">
      <Greeting />
      <DashboardMetrics />
      <DashboardCharts />
      <div className="grid auto-rows-max grid-cols-12 gap-[20px] lg:auto-rows-auto">
        <AnnouncementsCard className="col-span-full w-full 2xl:col-span-8" />
        <SupportCard className="col-span-full lg:col-span-6 xl:col-span-4" />
      </div>
    </div>
  );
}
