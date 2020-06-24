import { ConversaService } from './../../services/conversa.service';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaFiltro } from './../../../_common/models/conversa.filtro';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { SignalRService } from '../../services/signalr.service';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
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
  filtro: ConversaFiltro;

  constructor(
    public conversaService: ConversaService,
    private conversaSubjectsService: ConversaSubjectsService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    if (!this.contatoLogado) { return; }

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
      .receberMensagemLida()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.marcarMensagemComoLida(mensagem));

    this.signalRService
      .receberConversasDoContato()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberConversasDoContato(res));

    this.conversaSubjectsService
      .receberAtualizarContatosParaFechados()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.conversaService.fecharConversas());
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    const amigo = this.conversaService.obterConversaPorId(mensagem.conversaId);
    if(!amigo) { return; }

    amigo.statusUltimaMensagem = StatusMensagem.Lida;
    amigo.qtdMensagensNovas = 0;
    amigo.mostrarMensagensNovas = false;
  }

  validarContatoQueEstaDigitando(res) {
    const amigo = this.conversaService.obterConversaPorContatoAmigoId(res.contatoQueEstaDigitandoId);
    if(!amigo) { return; }

    amigo.estaDigitando = res.estaDigitando;
  }

  receberConversasDoContato(res: Resultado<UltimaConversa>) {
    this.conversaService.atualizarVariavelUltimasConversas(res);
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.signalRService.obterConversasDoContato(this.filtro);
  }

  existeConversas() {
    return this.conversaService.existeConversas();
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaService.fecharConversas();
    conversa.conversaAberta = true;
    this.conversaSubjectsService.abrirConversaSelecionada(conversa);
  }

  receberPrimeiraMensagem(mensagem: Mensagem) {
    const conversaNova = this.criarConversaPrimeiraMensagem(mensagem);
    this.conversaService.adicionarConversa(conversaNova);

    this.conversaSubjectsService.abrirPrimeiraConversa(conversaNova);
    if(this.contatoLogado.contatoId !== mensagem.contatoRemetenteId) {
      this.conversaSubjectsService.atualizarResultados();
    }
  }

  receberMensagem(mensagem: Mensagem) {
    const conversa = this.conversaService.obterConversaPorId(mensagem.conversaId);
    if(!conversa) { return; }

    this.atualizarUltimaConversa(conversa, mensagem);
    this.conversaService.ordenarConversas();

    if(this.contatoLogado.contatoId !== mensagem.contatoRemetenteId) {
      this.conversaSubjectsService.atualizarResultados();
    }
  }

  atualizarUltimaConversa(conversa: UltimaConversa, mensagem: Mensagem) {
    conversa.ultimaMensagem = mensagem.mensagemEnviada;
    conversa.dataEnvio = mensagem.dataEnvio;
    conversa.statusUltimaMensagem = mensagem.statusMensagem;
    conversa.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversa.contatoDestinatarioId = mensagem.contatoDestinatarioId;

    if(mensagem.contatoDestinatarioId === this.contatoLogado.contatoId && !conversa.conversaAberta) {
      conversa.qtdMensagensNovas++;
      conversa.mostrarMensagensNovas = true;
    }
  }

  criarConversaPrimeiraMensagem(mensagem: Mensagem) {
    const souORemetente = this.contatoLogado.contatoId === mensagem.contatoRemetenteId;

    const conversaNova = new UltimaConversa();
    conversaNova.contatoAmigoId = souORemetente
      ? mensagem.contatoDestinatarioId : mensagem.contatoRemetenteId;
    conversaNova.conversaId = mensagem.conversaId;
    conversaNova.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversaNova.contatoDestinatarioId = mensagem.contatoDestinatarioId;
    conversaNova.nome = souORemetente ? mensagem.nomeDestinatario : mensagem.nomeRemetente;
    conversaNova.email = souORemetente ? mensagem.emailDestinatario : mensagem.emailRemetente;
    conversaNova.fotoUrl = souORemetente ? mensagem.fotoUrlDestinatario : mensagem.fotoUrlRemetente;
    conversaNova.ultimaMensagem = mensagem.mensagemEnviada;
    conversaNova.dataEnvio = mensagem.dataEnvio;
    conversaNova.statusUltimaMensagem = mensagem.statusMensagem;

    if(!souORemetente) {
      conversaNova.qtdMensagensNovas = 1;
      conversaNova.mostrarMensagensNovas = true;
    }

    return conversaNova;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

