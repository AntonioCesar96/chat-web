import { JwtHelperService } from '@auth0/angular-jwt';
import { ConversaSubjectsService } from './services/conversa-subjects.service';
import { SignalRService } from './services/signalr.service';
import { AutenticacaoService } from '../autenticacao/services/autenticacao.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  mostrarDetalhes = false;
  mostrarPerfil = false;

  constructor(
    private router: Router,
    private location: Location,
    private autenticacaoService: AutenticacaoService,
    private signalRService: SignalRService,
    private conversaSubjectsService: ConversaSubjectsService,
    private jwtHelperService: JwtHelperService
  ) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) {
      this.router.navigate([`/entrar`]);
      return;
    }

    this.location.replaceState('/');
    this.inicializar();

    this.setTimeout();
  }

  inicializar() {
    const contato = this.autenticacaoService.getContatoLogado();
    this.signalRService.inicializar(contato.contatoId);

    this.conversaSubjectsService
      .receberMostrarDetalhes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarDetalhes(mostrar));

    this.conversaSubjectsService
      .receberMostrarPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarPerfil(mostrar));
  }

  receberMostrarDetalhes(mostrar) {
    this.mostrarDetalhes = mostrar;
  }

  receberMostrarPerfil(mostrar) {
    this.mostrarPerfil = mostrar;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // TODO: utilizar refresh token
  setTimeout() {
    setTimeout(() => {
      const token = localStorage.getItem('access_token');
      const expirou = this.jwtHelperService.isTokenExpired(token);
      if(expirou) {
        this.signalRService.desconectar();
        localStorage.removeItem('access_token');
        this.router.navigate([`/entrar`]);
        return;
      }
      this.setTimeout();
    }, 1000)
  }
}
