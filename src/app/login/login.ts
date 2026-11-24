import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ClienteService } from "../services/cliente-service";
import { SessaoService } from "../services/sessao-service";

@Component({
  imports: [FormsModule, RouterLink],
  selector: "app-login",
  templateUrl: "./login.html",
})
export class Login implements OnInit {
  email: string = "";
  senha: string = "";
  mensagem: string = "";
  enviando: boolean = false;

  constructor(
    private service: ClienteService,
    private sessao: SessaoService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // quem já está logado vai direto para o cadastro
    if (this.sessao.logado()) this.router.navigateByUrl("/cadastro");
  }

  fazerLogin() {
    if (this.email.trim().length == 0 || this.senha.length == 0) {
      this.mensagem = "Informe seu e-mail e sua senha.";
      return;
    }

    this.mensagem = "";
    this.enviando = true;

    this.service.login(this.email.trim(), this.senha).subscribe({
      next: (dados) => {
        this.enviando = false;
        // login inválido: a API devolve {} e o código não vem
        if (dados && dados.codigo > 0) {
          this.sessao.entrar(dados);
          this.router.navigateByUrl(this.destino());
        } else {
          this.mensagem = "E-mail ou senha incorretos. Confira e tente de novo.";
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.enviando = false;
        this.mensagem = "Não foi possível entrar agora. Tente novamente em instantes.";
        this.cd.detectChanges();
      },
    });
  }

  // Para onde ir depois de entrar (só caminhos internos do site)
  private destino(): string {
    const retorno = this.route.snapshot.queryParamMap.get("retorno") ?? "";
    return retorno.startsWith("/") && !retorno.startsWith("//") ? retorno : "/";
  }
}
