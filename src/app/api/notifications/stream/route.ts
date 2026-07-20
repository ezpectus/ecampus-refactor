import { getLocalUserLite } from '@/actions/local-user.actions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  const user = await getLocalUserLite();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastCheck = new Date();

  let interval: ReturnType<typeof setInterval>;
  let keepAlive: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          clearInterval(interval);
          clearInterval(keepAlive);
        }
      };

      interval = setInterval(async () => {
        try {
          const unread = await prisma.notification.count({
            where: { userId: user.id, read: false, createdAt: { gt: lastCheck } },
          });

          if (unread > 0) {
            sendEvent({ type: 'notifications', count: unread });
            lastCheck = new Date();
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 15_000);

      sendEvent({ type: 'connected', userId: user.id });

      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(keepAlive);
          clearInterval(interval);
        }
      }, 30_000);
    },
    cancel() {
      clearInterval(interval);
      clearInterval(keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
