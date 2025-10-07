import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf8');
    
    return new NextResponse(swContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Service worker not found', { status: 404 });
  }
}