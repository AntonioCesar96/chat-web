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
  mostrarNovaConversa = false;

  constructor(
    private router: Router,
    private location: Location,
    private autenticacaoService: AutenticacaoService,
    private signalRService: SignalRService,
    private conversaSubjectsService: ConversaSubjectsService,
  ) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) {
      this.router.navigate([`/entrar`]);
      return;
    }

    this.location.replaceState('/');
    this.inicializar();
  }

  inicializar() {
    const contato = this.autenticacaoService.getContatoLogado();
    this.signalRService.inicializar(contato.contatoId, localStorage.getItem('access_token'));

    this.conversaSubjectsService
      .receberMostrarDetalhes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarDetalhes(mostrar));

    this.conversaSubjectsService
      .receberMostrarPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarPerfil(mostrar));

    this.conversaSubjectsService
      .receberMostrarNovaConversa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarNovaConversa(mostrar));
  }

  receberMostrarDetalhes(mostrar) {
    this.mostrarDetalhes = mostrar;
  }

  receberMostrarPerfil(mostrar) {
    this.mostrarPerfil = mostrar;
  }

  receberMostrarNovaConversa(mostrar) {
    this.mostrarNovaConversa = mostrar;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
