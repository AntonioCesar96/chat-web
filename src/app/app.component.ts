import { CookieService } from './_common/services/cookie.service';
import { Contato } from './_common/models/contato.model';
import { AutenticacaoService } from './_common/services/autenticacao.service';
import { Router } from '@angular/router';
import { LoginService } from './autenticacao/login.service';
import { StringResources } from './string-resources';
import { UrlService } from './_common/services/url.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router,
    private autenticacaoService: AutenticacaoService,
    private cookieService: CookieService,
  ) { }

  async ngOnInit() {
    await this.autenticar();
  }

  private async autenticar() {
    if (this.validarCookies()) { return; }

    const email = this.cookieService.getCookie('email');
    const senha = this.cookieService.getCookie('senha');

    const res = await this.loginService.autenticar(email, senha).toPromise();
    await this.tratarRetornoAutenticao(res);
  }

  async tratarRetornoAutenticao(res) {
    this.autenticacaoService.setContatoLogado(res as Contato);
    this.router.navigate([`/home`]);
  }

  validarCookies() {
    return !this.cookieService.checkCookie('email')
      && !this.cookieService.checkCookie('senha');
  }
}
