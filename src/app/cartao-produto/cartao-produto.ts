import { Component, Input } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { Router } from "@angular/router";
import { Foto } from "../foto/foto";
import { Icone } from "../icone/icone";
import { Produto, emPromocao, precoFinal } from "../model/produto";
import { CestaService } from "../services/cesta-service";

@Component({
  selector: "app-cartao-produto",
  imports: [CurrencyPipe, Foto, Icone],
  templateUrl: "./cartao-produto.html",
})
export class CartaoProduto {
  @Input() produto: Produto = new Produto();

  constructor(
    private cesta: CestaService,
    private router: Router,
  ) {}

  promo(): boolean {
    return emPromocao(this.produto);
  }

  preco(): number {
    return precoFinal(this.produto);
  }

  desconto(): number {
    return Math.round((1 - this.produto.promo / this.produto.valor) * 100);
  }

  verDetalhe(evento: Event) {
    evento.preventDefault();
    localStorage.setItem("produto", JSON.stringify(this.produto));
    this.router.navigateByUrl("/detalhe");
  }

  comprar() {
    this.cesta.adicionar(this.produto);
    this.router.navigateByUrl("/cesta");
  }
}
