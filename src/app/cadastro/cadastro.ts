import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Cliente } from "../model/cliente";
import { ClienteService } from "../services/cliente-service";
import { SessaoService } from "../services/sessao-service";
import { cpfValido, emailValido, telefoneValido } from "../validacao";

// uma mensagem de erro por campo
interface Erros {
  nome?: string;
  email?: string;
  senha?: string;
  confirma?: string;
  documento?: string;
  telefone?: string;
  logradouro?: string;
}

@Component({
  imports: [FormsModule, RouterLink],
  selector: "app-cadastro",
  templateUrl: "./cadastro.html",
})
export class Cadastro implements OnInit {
  obj: Cliente = new Cliente();
  confirma: string = "";
  edicao: boolean = false; // true quando o cliente já está logado
  erros: Erros = {};
  sucesso: string = "";
  falha: string = "";
  enviando: boolean = false;

  constructor(
    private service: ClienteService,
    private sessao: SessaoService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Já logado: a tela vira "Meu cadastro" e usa PUT em vez de POST
    const atual = this.sessao.cliente();
    if (atual != null) {
      this.obj = { ...atual, senha: "" };
      this.edicao = true;
    }
  }

  gravar() {
    this.sucesso = "";
    this.falha = "";
    this.erros = this.validar();
    if (Object.keys(this.erros).length > 0) return;

    this.enviando = true;
    const dados: Cliente = { ...this.obj, nome: this.obj.nome.trim(), email: this.obj.email.trim() };

    if (this.edicao) {
      this.service.alterar(dados).subscribe({
        next: (resposta) => {
          this.enviando = false;
          if (/não encontrado/i.test(resposta)) {
            this.falha = "Não encontramos seu cadastro. Saia e entre novamente.";
          } else {
            this.sessao.entrar(dados);
            this.sucesso = "Dados atualizados com sucesso!";
          }
          this.cd.detectChanges();
        },
        error: (err) => this.aoFalhar(err),
      });
      return;
    }

    // Cadastro novo: grava e já entra na conta
    this.service.gravar(dados).subscribe({
      next: () => {
        this.service.login(dados.email, dados.senha).subscribe({
          next: (cliente) => {
            this.enviando = false;
            if (cliente && cliente.codigo > 0) {
              this.sessao.entrar({ ...dados, ...cliente });
              this.router.navigateByUrl("/");
            } else {
              this.router.navigateByUrl("/login");
            }
            this.cd.detectChanges();
          },
          error: (err) => this.aoFalhar(err),
        });
      },
      error: (err) => this.aoFalhar(err),
    });
  }

  private aoFalhar(err: unknown) {
    console.error(err);
    this.enviando = false;
    this.falha = "Não foi possível salvar agora. Tente novamente em instantes.";
    this.cd.detectChanges();
  }

  private validar(): Erros {
    const e: Erros = {};
    if (this.obj.nome.trim().length < 3) e.nome = "Informe seu nome completo.";
    if (!emailValido(this.obj.email)) e.email = "Informe um e-mail válido, como nome@exemplo.com.";
    if (this.obj.senha.length < 6) e.senha = "Use ao menos 6 caracteres.";
    if (this.confirma != this.obj.senha) e.confirma = "As senhas não conferem.";
    if (!cpfValido(this.obj.documento)) e.documento = "Informe um CPF válido.";
    if (!telefoneValido(this.obj.telefone)) e.telefone = "Informe o telefone com DDD.";
    if (this.obj.logradouro.trim().length < 8) e.logradouro = "Informe o endereço completo para a entrega.";
    return e;
  }
}
