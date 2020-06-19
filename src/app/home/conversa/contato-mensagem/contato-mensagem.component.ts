import { SignalRService } from './../../../_common/services/signalr.service';
import { OrigemConversa } from './../../../_common/models/ultima-conversa.model';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaService } from '../../services/conversa.service';
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

  constructor(
    private conversaService: ConversaService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.conversaSelecionadaSub = this.conversaService
      .conversaSelecionada()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => {
        if(conversa.origemConversa === OrigemConversa.ReceberPrimeiraMensagem) {
          if(this.ultimaConversa && this.ultimaConversa.conversaId === 0
            && conversa.contatoAmigoId === this.ultimaConversa.contatoAmigoId) {

              this.ultimaConversa = conversa
              this.signalRService.obterStatusDoContato(conversa.contatoAmigoId);
            return;
          }
          return;
        }

        this.ultimaConversa = conversa
        this.signalRService.obterStatusDoContato(conversa.contatoAmigoId);
      });

    this.signalRService
      .receberStatusContatoOnline()
      .pipe(takeUntil(this.destroy$))
      .subscribe((contatoId) => {
        if(!this.ultimaConversa || this.ultimaConversa.contatoAmigoId !== contatoId) { return; }
        this.ultimaConversa.online = true
      });

    this.signalRService
      .receberStatusContatoOffline()
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        if(!this.ultimaConversa || this.ultimaConversa.contatoAmigoId !== status.contatoId) { return; }
        this.ultimaConversa.online = true
        this.ultimaConversa.online = status.online;
        this.ultimaConversa.dataRegistroOnline = status.data;
        this.ultimaConversa.estaDigitando = false;
      });

    this.signalRService
      .receberStatusContato()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if(!res) { return; }
        this.ultimaConversa.online = res.online;
        this.ultimaConversa.dataRegistroOnline = res.data;
      });

    this.signalRService
      .receberContatoDigitando()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if(!this.ultimaConversa || this.ultimaConversa.contatoAmigoId !== res.contatoQueEstaDigitandoId) { return; }
        this.ultimaConversa.estaDigitando = res.estaDigitando;
      });
  }

  ultimoStatus() {
    if(this.ultimaConversa.online) {
      return 'On-line';
    }

    if(this.ultimaConversa.dataRegistroOnline) {
      return moment(this.ultimaConversa.dataRegistroOnline).calendar();
    }
    return '';
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
