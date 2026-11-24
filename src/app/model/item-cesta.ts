import { Produto, precoFinal } from "./produto";

export class ItemCesta {
  produto: Produto = new Produto();
  quantidade: number = 1;
  valorVenda: number = 0; // preço de uma unidade (promoção, se houver)
  valorTotal: number = 0; // valorVenda x quantidade

  constructor(obj: Produto) {
    this.produto = obj;
    this.valorVenda = precoFinal(obj);
    this.valorTotal = this.calculaItem();
  }

  // Recalcula o total do item (use depois de mudar a quantidade)
  public calculaItem(): number {
    this.valorTotal = this.quantidade * this.valorVenda;
    return this.valorTotal;
  }
}
