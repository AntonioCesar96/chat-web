import { ContatoStatus } from './../../../_common/models/contato-status.model';
import { SignalRService } from './../../../_common/services/signalr.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-contato-mensagem',
  templateUrl: './contato-mensagem.component.html'
})
export class ContatoMensagemComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  conversaSelecionadaSub: Subscription;

  @Input() contatoLogado: Contato;
  ultimaConversa: UltimaConversa;
  statusDoContato: ContatoStatus;

  constructor(
    private conversaService: ConversaSubjectsService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.conversaService
    .receberConversaSelecionadaMensagem()
    .pipe(takeUntil(this.destroy$))
    .subscribe((conversa) => this.abrirConversaSelecionada(conversa));

  this.conversaService
    .receberContatoSelecionadoMensagem()
    .pipe(takeUntil(this.destroy$))
    .subscribe((conversa) => this.abrirConversaSelecionada(conversa));

  this.conversaService
    .receberPrimeiraConversaMensagem()
    .pipe(takeUntil(this.destroy$))
    .subscribe((conversa) => this.abrirPrimeiraConversaMensagem(conversa));

  this.signalRService
    .receberStatusDoContato()
    .pipe(takeUntil(this.destroy$))
    .subscribe((status) => this.receberStatusDoContato(status));

  this.signalRService
    .receberContatoDigitando()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => this.receberContatoDigitando(res));
  }

  abrirConversaSelecionada(conversa: UltimaConversa) {
    this.ultimaConversa = conversa;
    this.statusDoContato = null;
    this.signalRService.obterStatusDoContato(conversa.contatoAmigoId);
  }

  abrirPrimeiraConversaMensagem(conversa: UltimaConversa) {
    if(this.ultimaConversa && this.ultimaConversa.conversaId === 0
      && conversa.contatoAmigoId === this.ultimaConversa.contatoAmigoId) {

        this.ultimaConversa = conversa;
        this.statusDoContato = null;
        this.signalRService.obterStatusDoContato(conversa.contatoAmigoId);
      return;
    }
  }

  receberStatusDoContato(status: ContatoStatus) {
    if(!this.ultimaConversa || this.ultimaConversa.contatoAmigoId !== status.contatoId) { return; }
    this.statusDoContato = status;

    if(!status) { return; }
    status.ultimoStatus = status.online ? 'On-line' : moment(status.data).calendar();
  }

  receberContatoDigitando(res) {
    if(!this.ultimaConversa || this.ultimaConversa.contatoAmigoId !== res.contatoQueEstaDigitandoId) { return; }
    this.statusDoContato.estaDigitando = res.estaDigitando;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
