import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { API } from "../config";
import { Produto } from "../model/produto";

// A API pode devolver o preço promocional como "promo" ou "valorPromo",
// e o nome como "nome" ou "descricao". Aqui a gente padroniza tudo.
function converter(bruto: any): Produto {
  const p = new Produto();
  p.codigo = Number(bruto?.codigo ?? 0);
  p.nome = bruto?.nome ?? bruto?.descricao ?? "";
  p.descritivo = bruto?.descritivo ?? "";
  p.quantidade = Number(bruto?.quantidade ?? 1); // sem o campo, vale como disponível
  p.valor = Number(bruto?.valor ?? 0);
  p.promo = Number(bruto?.promo ?? bruto?.valorPromo ?? 0);
  p.destaque = Number(bruto?.destaque ?? 0);
  p.keywords = bruto?.keywords ?? "";
  return p;
}

@Injectable({
  providedIn: "root",
})
export class ProdutoService {
  constructor(private http: HttpClient) {}

  public carregarVitrine(): Observable<Produto[]> {
    return this.http.get<any[]>(API + "/produto/vitrine").pipe(map((lista) => lista.map(converter)));
  }

  public pesquisar(termo: string): Observable<Produto[]> {
    return this.http
      .get<any[]>(API + "/produto/busca/" + encodeURIComponent(termo))
      .pipe(map((lista) => lista.map(converter)));
  }

  public listarTodos(): Observable<Produto[]> {
    return this.http.get<any[]>(API + "/produtos").pipe(map((lista) => lista.map(converter)));
  }

  public carregar(codigo: number): Observable<Produto> {
    return this.http.get<any>(API + "/produto/" + codigo).pipe(map(converter));
  }

  public gravar(obj: Produto): Observable<string> {
    return this.http.post(API + "/produto", obj, { responseType: "text" });
  }
}
