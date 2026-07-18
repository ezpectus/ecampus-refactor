import { getMonitoringById } from '@/actions/monitoring.actions';
import { StudySheetContent } from '@/app/[locale]/(private)/module/studysheet/[id]/page.content';
import { LoadingScreen } from '@/components/loading-screen';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InfoPage({ params }: Props) {
  const { id } = await params;

  let creditModule;
  try {
    creditModule = await getMonitoringById(id);
  } catch (error) {
    console.error('Failed to load study sheet:', error);
  }

  if (!creditModule) {
    return <LoadingScreen />;
  }

  return <StudySheetContent creditModule={creditModule} />;
}
