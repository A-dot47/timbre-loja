import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Pedido } from "../model/pedido";
import { PedidoService } from "../services/pedido-service";
import { SessaoService } from "../services/sessao-service";

@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe],
  selector: "app-lista-pedido",
  templateUrl: "./lista-pedido.html",
})
export class ListaPedido implements OnInit {
  lista: Pedido[] = [];
  mensagem: string = "";
  carregando: boolean = true;

  constructor(
    private service: PedidoService,
    private sessao: SessaoService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const cliente = this.sessao.cliente();
    if (cliente == null) {
      this.router.navigate(["/login"], { queryParams: { retorno: "/pedido" } });
      return;
    }

    this.service.listarCliente(cliente.codigo).subscribe({
      next: (dados) => {
        // pedidos mais novos primeiro
        this.lista = dados.sort((a, b) => b.codigoPedido - a.codigoPedido);
        if (this.lista.length <= 0) this.mensagem = "Você ainda não fez nenhum pedido.";
        this.carregando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.mensagem = "Não conseguimos carregar seus pedidos agora. Tente novamente.";
        this.carregando = false;
        this.cd.detectChanges();
      },
    });
  }
}
