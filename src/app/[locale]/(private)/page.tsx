import Greeting from './greeting';
import { AnnouncementsCard, SupportCard } from './cards';

export default function Home() {
  return (
    <div className="grid auto-rows-max grid-cols-12 gap-[20px] lg:auto-rows-auto">
      <Greeting className="col-span-full" />
      <AnnouncementsCard className="col-span-full w-full 2xl:col-span-8" />
      <SupportCard className="col-span-full lg:col-span-6 xl:col-span-4" />
    </div>
  );
}
