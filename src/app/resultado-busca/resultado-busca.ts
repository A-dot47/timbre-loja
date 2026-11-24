import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CartaoProduto } from "../cartao-produto/cartao-produto";
import { Produto } from "../model/produto";
import { ProdutoService } from "../services/produto-service";

@Component({
  imports: [RouterLink, CartaoProduto],
  selector: "app-resultado-busca",
  templateUrl: "./resultado-busca.html",
})
export class ResultadoBusca implements OnInit {
  lista: Produto[] = [];
  termo: string = "";
  carregando: boolean = true;
  erro: boolean = false;

  constructor(
    private service: ProdutoService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // roda de novo sempre que o termo da URL mudar
    this.route.queryParamMap.subscribe((params) => {
      this.termo = (params.get("termo") ?? "").trim();
      this.fazerBusca();
    });
  }

  fazerBusca() {
    this.carregando = true;
    this.erro = false;

    // sem termo, lista o catálogo inteiro
    const busca = this.termo ? this.service.pesquisar(this.termo) : this.service.listarTodos();
    busca.subscribe({
      next: (dados) => {
        this.lista = dados;
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.erro = true;
        this.carregando = false;
        this.cd.detectChanges();
      },
    });
  }
}
