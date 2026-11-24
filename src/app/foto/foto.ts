import { Component, Input } from "@angular/core";
import { Produto } from "../model/produto";

// Mostra a foto do produto (public/{codigo}.jpg). Se a foto não existir,
// desenha uma ilustração do tipo de instrumento.
@Component({
  selector: "app-foto",
  templateUrl: "./foto.html",
})
export class Foto {
  @Input() produto: Produto = new Produto();
  erro: boolean = false;

  // A foto pode estar em qualquer um destes formatos: public/{codigo}.jpg, .png, .jpeg ou .webp
  extensoes: string[] = ["jpg", "png", "jpeg", "webp"];
  tentativa: number = 0;

  get fonte(): string {
    return "/" + this.produto.codigo + "." + this.extensoes[this.tentativa];
  }

  // A imagem não carregou: tenta o próximo formato; se acabaram, mostra a ilustração
  falhou() {
    if (this.tentativa < this.extensoes.length - 1) {
      this.tentativa++;
    } else {
      this.erro = true;
    }
  }

  // Descobre o tipo de instrumento pelo nome (e, se precisar, pelas keywords)
  get tipo(): string {
    return this.descobrir(this.produto.nome) || this.descobrir(this.produto.keywords) || "nota";
  }

  get corCorpo(): string {
    return /baixo/i.test(this.produto.nome) ? "#1f5457" : "#a92b2f";
  }

  private descobrir(texto: string): string {
    const t = (texto || "").toLowerCase();
    if (/acess|cabo|encordoamento|palheta|capa|correia/.test(t)) return "nota";
    if (/bateria|caj[oó]n|percuss/.test(t)) return "bateria";
    if (/teclado|piano/.test(t)) return "teclado";
    if (/flauta|sax|sopro|clarinete/.test(t)) return "sopro";
    if (/baixo|guitarra/.test(t)) return "eletrica";
    if (/viol[aã]o|ukulele|cavaquinho/.test(t)) return "violao";
    return "";
  }
}
