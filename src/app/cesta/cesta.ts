import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Foto } from "../foto/foto";
import { Icone } from "../icone/icone";
import { ItemCesta } from "../model/item-cesta";
import { ItemPedido } from "../model/item-pedido";
import { Pedido } from "../model/pedido";
import { CestaService } from "../services/cesta-service";
import { PedidoService } from "../services/pedido-service";
import { SessaoService } from "../services/sessao-service";

@Component({
  imports: [RouterLink, CurrencyPipe, Foto, Icone],
  selector: "app-cesta",
  templateUrl: "./cesta.html",
})
export class Cesta implements OnInit {
  itens: ItemCesta[] = [];
  valorCesta: number = 0;
  mensagem: string = ""; // resposta da API quando o pedido é gravado
  erro: string = "";
  semEndereco: boolean = false;
  pedidoGravado: boolean = false;
  enviando: boolean = false;

  constructor(
    private cesta: CestaService,
    private sessao: SessaoService,
    private pedidoService: PedidoService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.carregarCesta();
  }

  carregarCesta() {
    this.itens = this.cesta.itens();
    this.valorCesta = this.cesta.total();
  }

  aumentar(item: ItemCesta) {
    this.mudarQuantidade(item, 1);
  }

  diminuir(item: ItemCesta) {
    this.mudarQuantidade(item, -1);
  }

  private mudarQuantidade(item: ItemCesta, delta: number) {
    this.erro = "";
    if (!this.cesta.alterarQuantidade(item.produto.codigo, delta)) {
      this.erro = "Não temos mais unidades de " + item.produto.nome + " em estoque.";
    }
    this.carregarCesta();
  }

  removerItem(item: ItemCesta) {
    this.cesta.remover(item.produto.codigo);
    this.carregarCesta();
  }

  limparCesta() {
    this.cesta.limpar();
    this.carregarCesta();
  }

  // Monta o pedido a partir da cesta e envia para a API
  gravarPedido() {
    this.erro = "";
    this.semEndereco = false;

    const cliente = this.sessao.cliente();
    if (cliente == null) {
      this.router.navigate(["/login"], { queryParams: { retorno: "/cesta" } });
      return;
    }
    if (!cliente.logradouro || cliente.logradouro.trim().length == 0) {
      this.semEndereco = true; // precisamos do endereço para a entrega
      return;
    }

    const pedido = new Pedido();
    pedido.codigoPedido = 0;
    pedido.codigoCliente = cliente.codigo;
    pedido.entrega = cliente.logradouro;
    pedido.obs = cliente.email;
    pedido.valorTotal = this.valorCesta;
    for (const item of this.itens) {
      pedido.itens.push(new ItemPedido(0, item.produto.codigo, item.quantidade, item.valorVenda));
    }

    this.enviando = true;
    this.pedidoService.gravar(pedido).subscribe({
      next: (dados) => {
        this.mensagem = dados;
        this.pedidoGravado = true;
        this.enviando = false;
        this.cesta.limpar();
        this.carregarCesta();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.erro = "Não foi possível enviar o pedido agora. Tente novamente em instantes.";
        this.enviando = false;
        this.cd.detectChanges();
      },
    });
  }
}
