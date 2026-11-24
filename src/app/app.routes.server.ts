import { RenderMode, ServerRoute } from '@angular/ssr';

// As telas dependem da API e do localStorage, então renderizamos no navegador.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
