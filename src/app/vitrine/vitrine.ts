import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CartaoProduto } from "../cartao-produto/cartao-produto";
import { Produto, emPromocao } from "../model/produto";
import { ProdutoService } from "../services/produto-service";

@Component({
  imports: [RouterLink, CartaoProduto],
  selector: "app-vitrine",
  templateUrl: "./vitrine.html",
})
export class Vitrine implements OnInit {
  lista: Produto[] = [];
  mensagem: string = "";
  carregando: boolean = true;
  promo: boolean = false; // a rota /promo mostra só os produtos em promoção
  esqueletos: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  constructor(
    private service: ProdutoService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.promo = this.route.snapshot.routeConfig?.path == "promo";
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.mensagem = "";

    const busca = this.promo ? this.service.listarTodos() : this.service.carregarVitrine();
    busca.subscribe({
      next: (dados) => {
        this.lista = this.promo ? dados.filter(emPromocao) : dados;
        if (this.lista.length <= 0) {
          this.mensagem = this.promo ? "Nenhuma promoção no momento." : "Ainda não há produtos em destaque.";
        }
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.mensagem = "Não conseguimos carregar os produtos agora. Tente novamente.";
        this.carregando = false;
        this.cd.detectChanges();
      },
    });
  }

  rolar() {
    document.getElementById("destaques")?.scrollIntoView({ behavior: "smooth" });
  }
}
