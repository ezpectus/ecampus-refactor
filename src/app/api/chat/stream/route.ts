import { getLocalUserLite } from '@/actions/local-user.actions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const user = await getLocalUserLite();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) {
    return new Response('Missing roomId', { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastCheck = new Date();

  let pollInterval: ReturnType<typeof setInterval>;
  let keepAlive: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          clearInterval(pollInterval);
          clearInterval(keepAlive);
        }
      };

      pollInterval = setInterval(async () => {
        try {
          const newMessages = await prisma.chatMessage.count({
            where: {
              roomId: Number(roomId),
              createdAt: { gt: lastCheck },
              senderId: { not: user.id },
            },
          });

          if (newMessages > 0) {
            sendEvent({ type: 'new-messages', count: newMessages, roomId: Number(roomId) });
            lastCheck = new Date();
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 10_000);

      sendEvent({ type: 'connected', roomId: Number(roomId) });

      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(keepAlive);
          clearInterval(pollInterval);
        }
      }, 30_000);
    },
    cancel() {
      clearInterval(pollInterval);
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
