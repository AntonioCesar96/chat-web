import { SignalRService } from './../../../_common/services/signalr.service';
import { ConversaService } from '../../services/conversa.service';
import { UltimaConversa, OrigemConversa } from './../../../_common/models/ultima-conversa.model';
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
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('mensagemEnviar') mensagem: ElementRef;
  @Input() contatoLogado: Contato;
  @Input() ultimaConversa: UltimaConversa;
  ultimoTimer: any;
  estaDigitando = false;
  tempo = 0;

  constructor(
    private conversaService: ConversaService,
    private signalRService: SignalRService)
  { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.conversaService
      .conversaSelecionada()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => {
        if(conversa.origemConversa === OrigemConversa.ReceberPrimeiraMensagem) {
          if(this.ultimaConversa && this.ultimaConversa.conversaId === 0
            && conversa.contatoAmigoId === this.ultimaConversa.contatoAmigoId) {

              this.ultimaConversa = conversa
            return;
          }
          return;
        }

        this.ultimaConversa = conversa
      });
  }

  onEnviarMensagem(event: KeyboardEvent) {
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

    this.signalRService.enviarMensagem(this.criarMensagem());
    this.mensagem.nativeElement.innerText = '';
    this.conversaService.esconderResultados(true);
  }

  criarMensagem() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId = this.contatoLogado.contatoId;
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
