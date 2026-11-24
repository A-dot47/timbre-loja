import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CATEGORIAS } from "./categorias";
import { Icone } from "./icone/icone";
import { Barrabusca } from "./barrabusca/barrabusca";
import { CestaService } from "./services/cesta-service";
import { SessaoService } from "./services/sessao-service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone, Barrabusca],
  templateUrl: "./app.html",
})
export class App {
  categorias = CATEGORIAS;
  ano = new Date().getFullYear();

  constructor(
    public cesta: CestaService,
    public sessao: SessaoService,
    private router: Router,
  ) {}

  sair() {
    this.sessao.sair();
    this.router.navigateByUrl("/login");
  }
}
