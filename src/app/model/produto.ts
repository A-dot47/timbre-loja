export class Produto {
  codigo: number = 0;
  nome: string = "";
  descritivo: string = "";
  quantidade: number = 0;
  valor: number = 0;
  promo: number = 0; // preço promocional (0 = sem promoção)
  destaque: number = 0;
  keywords: string = "";
}

/** O produto está em promoção? */
export function emPromocao(p: Produto): boolean {
  return p.promo > 0 && p.promo < p.valor;
}

/** Preço que o cliente realmente paga. */
export function precoFinal(p: Produto): number {
  return emPromocao(p) ? p.promo : p.valor;
}
