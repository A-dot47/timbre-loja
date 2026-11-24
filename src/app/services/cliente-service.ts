import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API } from "../config";
import { Cliente } from "../model/cliente";

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  constructor(private http: HttpClient) {}

  public carregar(codigo: number): Observable<Cliente> {
    return this.http.get<Cliente>(API + "/cliente/" + codigo);
  }

  public gravar(obj: Cliente): Observable<string> {
    return this.http.post(API + "/cliente", obj, { responseType: "text" });
  }

  public alterar(obj: Cliente): Observable<string> {
    return this.http.put(API + "/cliente", obj, { responseType: "text" });
  }

  public remover(codigo: number): Observable<string> {
    return this.http.delete(API + "/cliente/" + codigo, { responseType: "text" });
  }

  // Se o login falhar, a API devolve {} (sem "codigo").
  public login(email: string, senha: string): Observable<Cliente> {
    return this.http.post<Cliente>(API + "/cliente/login", { email: email, senha: senha });
  }

  public resetarSenha(email: string): Observable<string> {
    return this.http.patch(API + "/cliente/resetarSenha", { email: email }, { responseType: "text" });
  }

  public alterarSenha(email: string, documento: string, senha: string): Observable<string> {
    return this.http.patch(
      API + "/cliente/alterarSenha",
      { email: email, documento: documento, senha: senha },
      { responseType: "text" },
    );
  }
}
