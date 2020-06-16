import { AppSignalRService } from './../../_common/services/signalr.service';
import { SignalREventsService } from './../../_common/services/signalr-events.service';
import { StatusMensagem } from './../../_common/models/status-mensagem.enum';
import { ContatoStatus } from './../../_common/models/contato-status.model';
import { UltimaConversa } from './../../_common/models/ultima-conversa.model';
import { Mensagem } from './../../_common/models/mensagem.model';
import { Contato } from './../../_common/models/contato.model';
import { ConversaService } from '../services/conversa.service';
import { Resultado } from './../../_common/models/resultado.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { ConversaFiltro } from './../../_common/models/conversa.filtro';
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-conversas',
  templateUrl: './lista-conversas.component.html'
})
export class ListaConversasComponent implements OnInit, OnDestroy {
  @Output() criarComponente = new EventEmitter();
  filtro: ConversaFiltro;
  contatoLogado: Contato;
  resultado: Resultado<UltimaConversa>;
  receberMensagemSubscription: Subscription;
  contatoDigitandoSubscription: Subscription;
  receberStatusContatoOnlineSubscription: Subscription;
  receberStatusContatoOfflineSubscription: Subscription;
  receberMensagensLidasSubscription: Subscription;
  conversasDoContatoSubscription: Subscription;

  constructor(
    private conversaService: ConversaService,
    private autenticacaoService: AutenticacaoService,
    private appSignalRService: AppSignalRService,
    private signalREventsService: SignalREventsService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }

    this.obterContatoLogado();
    this.obterConversasDoContato(this.contatoLogado.contatoId);
    this.inicializar();
  }

  inicializar() {
    this.receberMensagemSubscription = this.signalREventsService
    .receberMensagem()
    .subscribe((mensagem) => {
      this.receberMensagem(mensagem);
    });

    this.contatoDigitandoSubscription = this.signalREventsService
      .receberContatoDigitando()
      .subscribe((res) => {
        this.validarContatoQueEstaDigitando(res);
    });

    this.receberStatusContatoOnlineSubscription = this.signalREventsService
      .receberStatusContatoOnline()
      .subscribe((contatoId: number) => {
        const amigo = this.resultado.lista.find(x => x.contatoAmigoId === contatoId);
        if(!amigo) { return; }
        amigo.online = true;
    });

    this.receberStatusContatoOfflineSubscription = this.signalREventsService
      .receberStatusContatoOffline()
      .subscribe((contatoStatus: ContatoStatus) => {
        // TODO: extrair metodo
        const amigo = this.resultado.lista.find(x => x.contatoAmigoId === contatoStatus.contatoId);
        if(!amigo) { return; }
        amigo.online = contatoStatus.online;
        amigo.dataRegistroOnline = contatoStatus.data;
        amigo.estaDigitando = false;
    });

    this.receberMensagemSubscription = this.signalREventsService
      .receberMensagemLida()
      .subscribe((mensagem: Mensagem) => {
        this.marcarMensagemComoLida(mensagem);
    });

    this.conversasDoContatoSubscription = this.signalREventsService
      .receberConversasDoContato()
      .subscribe((res: Resultado<UltimaConversa>) => {
        this.resultado = res;
        this.inicializarConversas();
    });
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    const amigo = this.resultado.lista.find(x => x.conversaId === mensagem.conversaId)
    if(!amigo) { return; }

    amigo.statusUltimaMensagem = StatusMensagem.Lida;
  }

  validarContatoQueEstaDigitando(res) {
    const amigo = this.resultado.lista.find(x => x.contatoAmigoId === res.contatoQueEstaDigitandoId)
    if(!amigo) { return; }

    amigo.estaDigitando = res.estaDigitando;
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.appSignalRService.run('ObterConversasDoContato', this.filtro);
  }

  inicializarConversas() {
    this.resultado.lista.forEach(conversa => conversa.conversaAberta = false);
  }

  obterContatoLogado() {
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.resultado.lista.forEach(x => x.conversaAberta = false);
    this.criarComponente.emit();
    this.conversaService.selecionarConversa(conversa);
  }

  receberMensagem(mensagem: Mensagem) {
    const conversa = this.resultado.lista.find(x => x.conversaId === mensagem.conversaId);
    if(!conversa) { return; }

    this.atualizarUltimaConversa(conversa, mensagem);
    this.ordenarConversas();
  }

  atualizarUltimaConversa(conversa: UltimaConversa, mensagem: Mensagem) {
    conversa.ultimaMensagem = mensagem.mensagemEnviada;
    conversa.dataEnvio = mensagem.dataEnvio;
    conversa.statusUltimaMensagem = mensagem.statusMensagem;
    conversa.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversa.contatoDestinatarioId = mensagem.contatoDestinatarioId;
    if(!conversa.conversaAberta) {
      conversa.qtdMensagensNovas++;
      conversa.mostrarMensagensNovas = mensagem.contatoDestinatarioId === this.contatoLogado.contatoId;
    }
  }

  ordenarConversas() {
    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  /*
    TODO:
  */
  receberPrimeiraMensagem(mensagem: Mensagem) {
    const conversa = new UltimaConversa();
    conversa.contatoAmigoId = this.contatoLogado.contatoId === mensagem.contatoRemetenteId
      ? mensagem.contatoDestinatarioId : mensagem.contatoRemetenteId;
    conversa.conversaId = mensagem.conversaId;
    conversa.dataEnvio = mensagem.dataEnvio;

    conversa.contatoAmigoId = mensagem.contatoDestinatarioId

    this.resultado.lista.push(conversa);
    this.resultado.total++;
    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  ngOnDestroy() {
    if (!this.receberMensagemSubscription) { return; }
    this.receberMensagemSubscription.unsubscribe();

    if (!this.contatoDigitandoSubscription) { return; }
    this.contatoDigitandoSubscription.unsubscribe();

    if (!this.receberStatusContatoOnlineSubscription) { return; }
    this.receberStatusContatoOnlineSubscription.unsubscribe();

    if (!this.receberStatusContatoOfflineSubscription) { return; }
    this.receberStatusContatoOfflineSubscription.unsubscribe();

    if (!this.receberMensagensLidasSubscription) { return; }
    this.receberMensagensLidasSubscription.unsubscribe();

    if (!this.conversasDoContatoSubscription) { return; }
    this.conversasDoContatoSubscription.unsubscribe();
  }
}
