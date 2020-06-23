import { ConversaSubjectsService } from './services/conversa-subjects.service';
import { SignalRService } from '../_common/services/signalr.service';
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
    this.signalRService.inicializar(contato.contatoId);

    this.conversaSubjectsService
      .receberMostrarDetalhes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarDetalhes(mostrar));
  }

  receberMostrarDetalhes(mostrar) {
    this.mostrarDetalhes = mostrar;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
