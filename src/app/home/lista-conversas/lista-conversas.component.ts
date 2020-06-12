import { UltimaConversa } from './../../_common/models/ultima-conversa.model';
import { Mensagem } from './../../_common/models/mensagem.model';
import { AppSignalRService } from './../../_common/services/signalr-service.service';
import { Contato } from './../../_common/models/contato.model';
import { ConversaHandleService } from './../services/conversa-handle.service';
import { Resultado } from './../../_common/models/resultado.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { ConversaFiltro } from './../../_common/models/conversa.filtro';
import { ConversaService } from '../services/conversa.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-conversas',
  templateUrl: './lista-conversas.component.html'
})
export class ListaConversasComponent implements OnInit, OnDestroy {
  filtro: ConversaFiltro;
  contatoLogado: Contato;
  resultado: Resultado<UltimaConversa>;
  receberMensagemSubscription: Subscription;

  constructor(
    private conversaService: ConversaService,
    private conversaHandleService: ConversaHandleService,
    private autenticacaoService: AutenticacaoService,
    private appSignalRService: AppSignalRService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }

    this.obterContatoLogado();
    this.obterConversasDoContato(this.contatoLogado.contatoId);
    this.inicializar();
  }

  ngOnDestroy() {
    if (!this.receberMensagemSubscription) { return; }
    this.receberMensagemSubscription.unsubscribe();
  }

  inicializar() {
    this.receberMensagemSubscription = this.appSignalRService
    .receberMensagem()
    .subscribe((mensagem) => {
      this.receberMensagem(mensagem);
    });
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.conversaService.obterConversasDoContato(this.filtro)
      .subscribe(res => {
        this.resultado = res as Resultado<UltimaConversa>;
      });
  }

  obterContatoLogado() {
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaHandleService.selecionarConversa(conversa);
  }

  receberMensagem(mensagem: Mensagem) {
    const conversa = this.resultado.lista.find(x => x.conversaId === mensagem.conversaId);
    if(!conversa) { return; }

    conversa.ultimaMensagem = mensagem.mensagemEnviada;
    conversa.dataEnvio = mensagem.dataEnvio;

    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

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
}
