export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        const data = JSON.stringify({ type: 'ping', count: count++ });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }, 30_000);

      return () => {
        clearInterval(interval);
      };
    },
    cancel() {
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
