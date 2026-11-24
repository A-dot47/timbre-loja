import { Component, OnInit } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Foto } from "../foto/foto";
import { Icone } from "../icone/icone";
import { Produto, emPromocao, precoFinal } from "../model/produto";
import { CestaService } from "../services/cesta-service";

@Component({
  imports: [RouterLink, CurrencyPipe, Foto, Icone],
  selector: "app-detalhe",
  templateUrl: "./detalhe.html",
})
export class Detalhe implements OnInit {
  obj: Produto = new Produto();
  mensagem: string = "";

  constructor(
    private cesta: CestaService,
    private router: Router,
  ) {}

  // O produto clicado na vitrine ou na busca fica guardado em "produto"
  ngOnInit() {
    const json = localStorage.getItem("produto");
    if (json == null) {
      this.mensagem = "Produto inválido. Volte à loja e escolha um produto.";
    } else {
      this.obj = JSON.parse(json);
    }
  }

  promo(): boolean {
    return emPromocao(this.obj);
  }

  preco(): number {
    return precoFinal(this.obj);
  }

  palavras(): string[] {
    return (this.obj.keywords || "")
      .split(/[,;\s]+/)
      .filter((p) => p.length > 2)
      .slice(0, 6);
  }

  comprar() {
    this.cesta.adicionar(this.obj);
    this.router.navigateByUrl("/cesta");
  }
}
