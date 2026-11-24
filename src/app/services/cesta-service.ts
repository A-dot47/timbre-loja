import { Injectable, signal } from "@angular/core";
import { Cesta } from "../model/cesta";
import { ItemCesta } from "../model/item-cesta";
import { Produto } from "../model/produto";

// Guarda a Cesta no localStorage (chave "cesta").
// A conta e as regras ficam na classe Cesta; aqui só lemos e gravamos.
@Injectable({
  providedIn: "root",
})
export class CestaService {
  // total de unidades na cesta; o cabeçalho lê este valor
  quantidade = signal(0);

  constructor() {
    this.quantidade.set(this.carregar().quantidadeTotal());
  }

  itens(): ItemCesta[] {
    return this.carregar().itens;
  }

  total(): number {
    return this.carregar().calculaTotal();
  }

  adicionar(produto: Produto) {
    const cesta = this.carregar();
    cesta.adicionarItem(produto);
    this.salvar(cesta);
  }

  // delta = +1 ou -1. Devolve false se passar do estoque.
  alterarQuantidade(codigo: number, delta: number): boolean {
    const cesta = this.carregar();
    const ok = cesta.alterarQuantidade(codigo, delta);
    this.salvar(cesta);
    return ok;
  }

  remover(codigo: number) {
    const cesta = this.carregar();
    cesta.removerItem(codigo);
    this.salvar(cesta);
  }

  limpar() {
    const cesta = this.carregar();
    cesta.limpar();
    this.salvar(cesta);
  }

  private carregar(): Cesta {
    const json = typeof localStorage === "undefined" ? null : localStorage.getItem("cesta");
    return new Cesta(json);
  }

  private salvar(cesta: Cesta) {
    cesta.calculaTotal();
    localStorage.setItem("cesta", JSON.stringify(cesta));
    this.quantidade.set(cesta.quantidadeTotal());
  }
}
