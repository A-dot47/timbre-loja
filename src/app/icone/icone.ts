import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icone',
  template: `
    <svg
      [attr.width]="tamanho()"
      [attr.height]="tamanho()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (nome()) {
        @case ('busca') {
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        }
        @case ('usuario') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        }
        @case ('cesta') {
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
          <path d="M2 3h3l2.7 11.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6" />
        }
        @case ('nota') {
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        }
        @case ('lixeira') {
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
        }
        @case ('sair') {
          <path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />
        }
        @case ('mais') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('menos') {
          <path d="M5 12h14" />
        }
        @case ('seta') {
          <path d="M19 12H5M12 19l-7-7 7-7" />
        }
        @case ('lista') {
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        }
        @case ('ok') {
          <path d="M20 6L9 17l-5-5" />
        }
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class Icone {
  nome = input.required<string>();
  tamanho = input(20);
}
