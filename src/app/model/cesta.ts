import { Cliente } from "./cliente";
import { ItemCesta } from "./item-cesta";
import { Produto } from "./produto";

export class Cesta {
  cliente: Cliente = new Cliente();
  total: number = 0;
  itens: ItemCesta[] = [];

  // Recebe o texto guardado no localStorage (ou null, para uma cesta vazia)
  constructor(jsonString: string | null) {
    try {
      if (jsonString != null) {
        const dados = JSON.parse(jsonString);
        // versões antigas guardavam só a lista de itens
        const lista: any[] = Array.isArray(dados) ? dados : dados.itens || [];
        // o JSON perde os métodos, então recriamos cada ItemCesta de verdade
        for (const o of lista) {
          const item = new ItemCesta(Object.assign(new Produto(), o.produto));
          item.quantidade = o.quantidade || 1;
          item.valorVenda = o.valorVenda ?? item.valorVenda;
          item.calculaItem();
          this.itens.push(item);
        }
        this.calculaTotal();
      }
    } catch (e) {
      console.error("Erro ao converter a cesta do localStorage", e);
      this.itens = [];
    }
  }

  // Soma o valor de todos os itens
  public calculaTotal(): number {
    let soma = 0;
    for (const item of this.itens) soma += item.calculaItem();
    this.total = soma;
    return this.total;
  }

  // Total de unidades (somando as quantidades)
  public quantidadeTotal(): number {
    let soma = 0;
    for (const item of this.itens) soma += item.quantidade;
    return soma;
  }

  public adicionarItem(p: Produto) {
    // se o produto já está na cesta, só aumenta a quantidade
    const existente = this.itens.find((i) => i.produto.codigo == p.codigo);
    if (existente) {
      existente.quantidade++;
    } else {
      this.itens.push(new ItemCesta(p));
    }
    this.calculaTotal();
  }

  // delta = +1 ou -1. Devolve false se passar do estoque.
  public alterarQuantidade(codigo: number, delta: number): boolean {
    const item = this.itens.find((i) => i.produto.codigo == codigo);
    if (!item) return true;

    const nova = item.quantidade + delta;
    if (nova <= 0) {
      this.removerItem(codigo);
      return true;
    }
    if (item.produto.quantidade > 0 && nova > item.produto.quantidade) return false;

    item.quantidade = nova;
    this.calculaTotal();
    return true;
  }

  public removerItem(codigo: number) {
    this.itens = this.itens.filter((i) => i.produto.codigo != codigo);
    this.calculaTotal();
  }

  public limpar() {
    this.itens = [];
    this.calculaTotal();
  }
}
