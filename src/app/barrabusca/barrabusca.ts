import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Icone } from "../icone/icone";

@Component({
  imports: [FormsModule, Icone],
  selector: "app-barrabusca",
  templateUrl: "./barrabusca.html",
})
export class Barrabusca {
  termo: string = ""; // ligado ao campo de busca com [(ngModel)]

  constructor(private router: Router) {}

  // Chamado a cada letra digitada: guarda o texto no localStorage
  guardar() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("termoBusca", JSON.stringify(this.termo));
  }

  buscar() {
    this.guardar();
    const termo = this.termo.trim();
    // o termo também vai na URL: /resultado-busca?termo=violão
    this.router.navigate(["/resultado-busca"], { queryParams: termo ? { termo: termo } : {} });
  }
}
