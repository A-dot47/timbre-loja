import { Injectable, signal } from "@angular/core";
import { Cliente } from "../model/cliente";

// Guarda quem está logado no localStorage (chave "cliente").
@Injectable({
  providedIn: "root",
})
export class SessaoService {
  // primeiro nome do cliente logado; o cabeçalho lê este valor
  nome = signal("");

  constructor() {
    this.atualizarNome();
  }

  cliente(): Cliente | null {
    if (typeof localStorage === "undefined") return null;
    const json = localStorage.getItem("cliente");
    if (json == null) return null;
    const obj: Cliente = JSON.parse(json);
    return obj.codigo > 0 ? obj : null;
  }

  logado(): boolean {
    return this.cliente() != null;
  }

  entrar(cliente: Cliente) {
    // a senha nunca fica guardada no navegador
    const guardar: Cliente = { ...new Cliente(), ...cliente, senha: "" };
    localStorage.setItem("cliente", JSON.stringify(guardar));
    this.atualizarNome();
  }

  sair() {
    localStorage.removeItem("cliente");
    this.atualizarNome();
  }

  private atualizarNome() {
    const c = this.cliente();
    this.nome.set(c ? c.nome.trim().split(" ")[0] : "");
  }
}
