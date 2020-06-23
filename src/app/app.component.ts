import { SignalRService } from './_common/services/signalr.service';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { CookieService } from './_common/services/cookie.service';
import { Contato } from './_common/models/contato.model';
import { AutenticacaoService } from './autenticacao/services/autenticacao.service';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from './autenticacao/services/login.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  usuarioLogouEmOutroLugar = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private location: Location,
    private autenticacaoService: AutenticacaoService,
    private cookieService: CookieService,
    private signalRService: SignalRService
  ) { }

  async ngOnInit() {
    this.inicializar();
    await this.autenticar();
  }

  inicializar() {
    moment.locale('pt-br');
    this.addEventoReload();

    this.signalRService
      .receberDeslogar()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.usuarioLogouEmOutroLugar = true);
  }

  addEventoReload() {
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        if(event.url === '/home' || event.url === '/') { return; }
        this.recarregar();
      }
    });
  }

  recarregar() {
    this.location.replaceState('/');
    location.reload();
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
