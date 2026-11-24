import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ClienteService } from "../services/cliente-service";
import { emailValido } from "../validacao";

@Component({
  imports: [FormsModule, RouterLink],
  selector: "app-reenvio",
  templateUrl: "./reenvio.html",
})
export class Reenvio {
  email: string = "";
  sucesso: string = "";
  falha: string = "";
  enviando: boolean = false;

  constructor(
    private service: ClienteService,
    private cd: ChangeDetectorRef,
  ) {}

  enviar() {
    this.sucesso = "";
    this.falha = "";

    if (!emailValido(this.email)) {
      this.falha = "Informe um e-mail válido, como nome@exemplo.com.";
      return;
    }

    this.enviando = true;
    this.service.resetarSenha(this.email.trim()).subscribe({
      next: (resposta) => {
        this.enviando = false;
        this.sucesso = resposta || "Pronto. Verifique seu e-mail.";
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.enviando = false;
        this.falha = "Não foi possível enviar agora. Tente novamente em instantes.";
        this.cd.detectChanges();
      },
    });
  }
}
