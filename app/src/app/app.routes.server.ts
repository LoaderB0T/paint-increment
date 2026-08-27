import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/**',
    renderMode: RenderMode.Client,
  },
  // Auth-guarded routes: isLoggedInGuard denies on the server, which cancels the
  // navigation and makes the SSR engine return a 404. Render them on the client.
  {
    path: 'lobby/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'lobby/my',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
