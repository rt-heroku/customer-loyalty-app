import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const serviceWorkerCode = `
// Simple Service Worker for Customer Loyalty App
console.log('Service Worker: Starting');

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(self.clients.claim());
});

// Fetch event - basic caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Return the response from network
        return response;
      })
      .catch(() => {
        // If network fails, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return new Response(\`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Offline - Customer Loyalty App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body>
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
              </body>
            </html>
          \`, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })
  );
});
`;

  return new NextResponse(serviceWorkerCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Service-Worker-Allowed': '/'
    }
  });
}
