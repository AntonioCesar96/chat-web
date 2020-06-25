import { SignalRService } from './home/services/signalr.service';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Contato } from './_common/models/contato.model';
import { AutenticacaoService } from './autenticacao/services/autenticacao.service';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from './autenticacao/services/login.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

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
    private signalRService: SignalRService,
    private jwtHelperService: JwtHelperService
  ) { }

  async ngOnInit() {
    moment.locale('pt-br');
    this.autenticar();
  }

  private autenticar() {
    const token = localStorage.getItem('access_token');
    if (!token) { return; }

    const expirou = this.jwtHelperService.isTokenExpired(token);
    if(expirou) {
      localStorage.removeItem('access_token');
      this.router.navigate([`/entrar`]);
      return;
    }

    const email = this.jwtHelperService.decodeToken(token).unique_name;
    this.loginService.obterPorEmail(token, email)
      .subscribe(contato => {
        this.tratarRetornoAutenticao(contato);
    });
  }

  tratarRetornoAutenticao(contato: Contato) {
    this.signalRService
      .receberDeslogar()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.usuarioLogouEmOutroLugar = true);

    this.autenticacaoService.setContatoLogado(contato);
    this.router.navigate([`/home`]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
