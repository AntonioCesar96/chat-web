import { ContatoStatus } from './../../../_common/models/contato-status.model';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaFiltro } from './../../../_common/models/conversa.filtro';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { SignalRService } from './../../../_common/services/signalr.service';
import { ConversaService } from './../../services/conversa.service';
import { AutenticacaoService } from './../../../_common/services/autenticacao.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lista-conversas',
  templateUrl: './lista-conversas.component.html'
})
export class ListaConversasComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() contatoLogado: Contato;
  @Output() criarComponente = new EventEmitter<UltimaConversa>();
  ultimaConversaAberta: UltimaConversa;
  filtro: ConversaFiltro;
  resultado: Resultado<UltimaConversa>;

  constructor(
    private conversaService: ConversaService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
    this.obterConversasDoContato(this.contatoLogado.contatoId);
  }

  inicializar() {
    this.signalRService
      .receberMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberMensagem(mensagem));

    this.signalRService
      .receberPrimeiraMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberPrimeiraMensagem(mensagem));

    this.signalRService
      .receberContatoDigitando()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.validarContatoQueEstaDigitando(res));

    this.signalRService
      .receberStatusContatoOnline()
      .pipe(takeUntil(this.destroy$))
      .subscribe((contatoId) => this.marcarStatusContatoOnline(contatoId));

    this.signalRService
      .receberStatusContatoOffline()
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => this.marcarStatusContatoOffline(status));

    this.signalRService
      .receberMensagemLida()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.marcarMensagemComoLida(mensagem));

    this.signalRService
      .receberConversasDoContato()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberConversasDoContato(res));
  }

  marcarStatusContatoOnline(contatoId: number) {
    const amigo = this.resultado.lista.find(x => x.contatoAmigoId === contatoId);
    if(!amigo) { return; }
    amigo.online = true;
  }

  marcarStatusContatoOffline(contatoStatus: ContatoStatus) {
    const amigo = this.resultado.lista.find(x => x.contatoAmigoId === contatoStatus.contatoId);
    if(!amigo) { return; }
    amigo.online = contatoStatus.online;
    amigo.dataRegistroOnline = contatoStatus.data;
    amigo.estaDigitando = false;
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    const amigo = this.resultado.lista.find(x => x.conversaId === mensagem.conversaId)
    if(!amigo) { return; }

    amigo.statusUltimaMensagem = StatusMensagem.Lida;
    amigo.qtdMensagensNovas = 0;
    amigo.mostrarMensagensNovas = false;
  }

  validarContatoQueEstaDigitando(res) {
    const amigo = this.resultado.lista.find(x => x.contatoAmigoId === res.contatoQueEstaDigitandoId)
    if(!amigo) { return; }

    amigo.estaDigitando = res.estaDigitando;
  }

  receberConversasDoContato(res: Resultado<UltimaConversa>) {
    this.resultado = res;
    this.resultado.lista.forEach(conversa => conversa.conversaAberta = false);
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.signalRService.obterConversasDoContato(this.filtro);
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.ultimaConversaAberta = conversa;
    this.resultado.lista.forEach(x => x.conversaAberta = false);
    this.conversaService.selecionarConversa(conversa);
  }

  receberPrimeiraMensagem(mensagem: Mensagem) {
    const souOContatoAmigo = this.contatoLogado.contatoId === mensagem.contatoRemetenteId;

    const conversaNova = new UltimaConversa();
    conversaNova.contatoAmigoId = souOContatoAmigo
      ? mensagem.contatoDestinatarioId : mensagem.contatoRemetenteId;
    conversaNova.conversaId = mensagem.conversaId;
    conversaNova.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversaNova.contatoDestinatarioId = mensagem.contatoDestinatarioId;
    conversaNova.nome = souOContatoAmigo ? mensagem.nomeDestinatario : mensagem.nomeRemetente;
    conversaNova.email = souOContatoAmigo ? mensagem.emailDestinatario : mensagem.emailRemetente;
    conversaNova.fotoUrl = souOContatoAmigo ? mensagem.fotoUrlDestinatario : mensagem.fotoUrlRemetente;
    conversaNova.ultimaMensagem = mensagem.mensagemEnviada;
    conversaNova.dataEnvio = mensagem.dataEnvio;
    conversaNova.statusUltimaMensagem = mensagem.statusMensagem;
    conversaNova.conversaNova = true;

    if(!souOContatoAmigo) {
      conversaNova.qtdMensagensNovas = 1;
      conversaNova.mostrarMensagensNovas = true;
    }

    this.resultado.lista.push(conversaNova);
    this.resultado.total++;
    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());

    this.ordenarConversas();
    this.conversaService.selecionarConversa(conversaNova);
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
