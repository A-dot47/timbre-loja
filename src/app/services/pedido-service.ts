import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API } from "../config";
import { Pedido } from "../model/pedido";

@Injectable({
  providedIn: "root",
})
export class PedidoService {
  constructor(private http: HttpClient) {}

  public gravar(obj: Pedido): Observable<string> {
    return this.http.post(API + "/pedido", obj, { responseType: "text" });
  }

  public alterar(obj: Pedido): Observable<string> {
    return this.http.put(API + "/pedido", obj, { responseType: "text" });
  }

  public pesquisar(codigo: number): Observable<Pedido> {
    return this.http.get<Pedido>(API + "/pedido/" + codigo);
  }

  // Todos os pedidos de um cliente
  public listarCliente(codigo: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(API + "/pedido/cliente/" + codigo);
  }
}
