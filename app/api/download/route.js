import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const BLOQUE = randomBytes(1024 * 1024);

export async function GET() {
  return new Response(BLOQUE, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(BLOQUE.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}