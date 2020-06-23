import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { AutenticacaoService } from '../../autenticacao/services/autenticacao.service';
import { ConversaSubjectsService } from './../services/conversa-subjects.service';
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Contato } from 'src/app/_common/models/contato.model';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
})
export class DetalhesComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  contatoLogado: Contato;
  ultimaConversa: UltimaConversa;

  constructor(
    private conversaService: ConversaSubjectsService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.inicializar();
  }

  inicializar() {
    this.conversaService
      .receberAbrirDetalhes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.receberAbrirDetalhes(conversa));
  }

  receberAbrirDetalhes(conversa) {
    this.ultimaConversa = conversa
    this.conversaService.mostrarDetalhes(true);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
