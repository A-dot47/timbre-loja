import { Routes } from "@angular/router";
import { Vitrine } from "./vitrine/vitrine";
import { Detalhe } from "./detalhe/detalhe";
import { ResultadoBusca } from "./resultado-busca/resultado-busca";
import { Cesta } from "./cesta/cesta";
import { Login } from "./login/login";
import { Cadastro } from "./cadastro/cadastro";
import { Reenvio } from "./reenvio/reenvio";
import { ListaPedido } from "./lista-pedido/lista-pedido";

export const routes: Routes = [
  { path: "", component: Vitrine, title: "Timbre | Instrumentos musicais" },
  { path: "vitrine", component: Vitrine, title: "Timbre | Instrumentos musicais" },
  { path: "promo", component: Vitrine, title: "Promoções | Timbre" },
  { path: "detalhe", component: Detalhe, title: "Produto | Timbre" },
  { path: "resultado-busca", component: ResultadoBusca, title: "Busca | Timbre" },
  { path: "cesta", component: Cesta, title: "Sua cesta | Timbre" },
  { path: "login", component: Login, title: "Entrar | Timbre" },
  { path: "cadastro", component: Cadastro, title: "Meu cadastro | Timbre" },
  { path: "reenvio", component: Reenvio, title: "Recuperar senha | Timbre" },
  { path: "pedido", component: ListaPedido, title: "Meus pedidos | Timbre" },
  { path: "**", redirectTo: "" },
];
