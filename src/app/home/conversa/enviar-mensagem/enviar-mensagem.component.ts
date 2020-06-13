import { ConversaHandleService } from './../../services/conversa-handle.service';
import { UltimaConversa } from './../../../_common/models/ultima-conversa.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { AppSignalRService } from './../../../_common/services/signalr-service.service';
import { Mensagem } from './../../../_common/models/mensagem.model';
import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enviar-mensagem',
  templateUrl: './enviar-mensagem.component.html'
})
export class EnviarMensagemComponent implements OnInit, OnDestroy {
  @ViewChild('mensagemEnviar') mensagem: ElementRef;
  @Input() contato: Contato;
  @Input() ultimaConversa: UltimaConversa;
  estaDigitando = false;
  tempo = 0;
  ultimoTimer;
  conversaSubscription: Subscription;

  constructor(
    private conversaHandleService: ConversaHandleService,
    private appSignalRService: AppSignalRService)
  { }

  ngOnInit() {
    this.inicializar();
  }

  ngOnDestroy() {
    if (!this.conversaSubscription) { return; }
    this.conversaSubscription.unsubscribe();
  }

  inicializar() {
    this.conversaSubscription = this.conversaHandleService
      .conversaSelecionada()
      .subscribe((conversa) => {
        this.ultimaConversa = conversa;
    });
  }

  onEnviarMensagem(event: KeyboardEvent) {
    // tslint:disable-next-line: deprecation
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.enviarMensagem();
      return false;
    }
  }

  enviarMensagem() {
    if(!this.mensagem.nativeElement.innerText ||
      this.mensagem.nativeElement.innerText === '') {
      return;
    }

    clearTimeout(this.ultimoTimer);
    this.enviarQueNaoEstaDigitando();

    this.appSignalRService.run('EnviarMensagem', this.criarMensagem());
    this.mensagem.nativeElement.innerText = '';
  }

  criarMensagem() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId = this.contato.contatoId;
    mensagem.contatoDestinatarioId = this.ultimaConversa.contatoAmigoId;
    mensagem.mensagemEnviada = this.mensagem.nativeElement.innerText;
    return mensagem;
  }

  avisarContatoDigitando() {
    this.tempo =  new Date().getTime();
    this.enviarQueEstaDigitando();

    clearTimeout(this.ultimoTimer);
    this.validarTempo();
  }

  validarTempo() {
    this.ultimoTimer = setTimeout(() => {
      if((new Date().getTime() - this.tempo) <= 3000) {
        this.validarTempo();
        return;
      }
      this.enviarQueNaoEstaDigitando();
    }, 1000);
  }

  enviarQueEstaDigitando() {
    if(this.estaDigitando) { return; }

    this.estaDigitando = true;

    this.appSignalRService.run('EnviarContatoDigitando',
      true, this.ultimaConversa.contatoAmigoId, this.contato.contatoId);
  }

  enviarQueNaoEstaDigitando() {
    if(!this.estaDigitando) { return; }

    this.estaDigitando = false;
    this.appSignalRService.run('EnviarContatoDigitando',
      false, this.ultimaConversa.contatoAmigoId, this.contato.contatoId);
  }
}
