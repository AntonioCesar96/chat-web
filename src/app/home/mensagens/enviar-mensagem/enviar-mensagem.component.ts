import { SignalRService } from '../../services/signalr.service';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { UltimaConversa } from './../../../_common/models/ultima-conversa.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { Mensagem } from './../../../_common/models/mensagem.model';
import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-enviar-mensagem',
  templateUrl: './enviar-mensagem.component.html'
})
export class EnviarMensagemComponent implements OnInit, OnDestroy {
  @ViewChild('mensagemEnviar') mensagem: ElementRef;
  @Input() contatoLogado: Contato;
  @Input() ultimaConversa: UltimaConversa;

  destroy$: Subject<boolean> = new Subject<boolean>();
  estaDigitando = false;
  mostrarLabel = true;
  timerIdValidacaoDigitando: any;
  horaQueEstavaDigitando = 0;

  constructor(
    private conversaService: ConversaSubjectsService,
    private signalRService: SignalRService)
  { }

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
  }

  abrirConversaSelecionada(conversa: UltimaConversa) {
    this.ultimaConversa = conversa;
  }

  abrirPrimeiraConversaMensagem(conversa: UltimaConversa) {
    if(!this.ehElegivelParaAbrirPrimeiraConversaMensagem(conversa)) { return; }
    this.ultimaConversa = conversa
  }

  ehElegivelParaAbrirPrimeiraConversaMensagem(conversa: UltimaConversa) {
    return this.ultimaConversa && this.ultimaConversa.conversaId === 0
      && conversa.contatoAmigoId === this.ultimaConversa.contatoAmigoId;
  }

  enterEnviarMensagem(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.enviarMensagem();
      return false;
    }
  }

  enviarMensagem() {
    if(!this.ehElegivelParaEnviarMensagem()) { return; }

    this.removerValidacaoTempoDigitando();
    this.enviarQueNaoEstaDigitando();

    this.signalRService.enviarMensagem(this.criarMensagem());
    this.conversaService.esconderResultados(true);
    this.mensagem.nativeElement.innerText = '';
    this.validarMostrarLabel();
  }

  ehElegivelParaEnviarMensagem() {
    return this.mensagem.nativeElement.innerText &&
      this.mensagem.nativeElement.innerText.trim() !== '';
  }

  criarMensagem() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId = this.contatoLogado.contatoId;
    mensagem.contatoDestinatarioId = this.ultimaConversa.contatoAmigoId;
    mensagem.mensagemEnviada = this.mensagem.nativeElement.innerText.trim();
    return mensagem;
  }

  validarMostrarLabel() {
    this.mostrarLabel = !this.ehElegivelParaEnviarMensagem();
  }

  avisarContatoDigitando() {
    this.validarMostrarLabel();
    this.horaQueEstavaDigitando = this.obterHoraAtual();

    this.enviarQueEstaDigitando();
    this.removerValidacaoTempoDigitando();
    this.validarTempoParaAvisarQueParouDeDigitar();
  }

  removerValidacaoTempoDigitando() {
    clearTimeout(this.timerIdValidacaoDigitando);
  }

  validarTempoParaAvisarQueParouDeDigitar() {
    this.timerIdValidacaoDigitando = setTimeout(() => {
      if(this.ehElegivelParaAvisarQueParouDeDigitar()) {
        this.validarTempoParaAvisarQueParouDeDigitar();
        return;
      }
      this.enviarQueNaoEstaDigitando();
    }, 1000);
  }

  ehElegivelParaAvisarQueParouDeDigitar() {
    return (this.obterHoraAtual() - this.horaQueEstavaDigitando) <= 3000;
  }

  obterHoraAtual() {
    return new Date().getTime();
  }

  enviarQueEstaDigitando() {
    if(this.estaDigitando) { return; }

    this.estaDigitando = true;
    this.signalRService.enviarContatoDigitando(true,
      this.ultimaConversa.contatoAmigoId, this.contatoLogado.contatoId);
  }

  enviarQueNaoEstaDigitando() {
    if(!this.estaDigitando) { return; }

    this.estaDigitando = false;
    this.signalRService.enviarContatoDigitando(false,
      this.ultimaConversa.contatoAmigoId, this.contatoLogado.contatoId);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
