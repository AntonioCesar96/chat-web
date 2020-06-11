import { Conversa } from './../../_common/models/conversa.model';
import { ConversaHandleService } from './../services/conversa-handle.service';
import { Contato } from './../../_common/models/contato.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { MensagemService } from '../services/mensagem.service';
import { MensagemFiltro } from './../../_common/models/mensagem.filtro';
import { Resultado } from './../../_common/models/resultado.model';
import { Mensagem } from './../../_common/models/mensagem.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.component.html',
  styleUrls: ['./conversa.component.scss']
})
export class ConversaComponent implements OnInit, OnDestroy {
  filtro: MensagemFiltro;
  resultado: Resultado<Mensagem>;
  contato: Contato;
  conversa: Conversa;
  conversaSubscription: Subscription;

  constructor(
    private mensagemService: MensagemService,
    private conversaHandleService: ConversaHandleService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.obterContatoLogado();
    this.inicializar();
  }

  obterContatoLogado() {
    this.contato = this.autenticacaoService.getContatoLogado();
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  definirClasse(item: Mensagem) {
    return item.contatoRemetenteId === this.contato.contatoId  ? 'enviado' : 'recebido';
  }

  ngOnDestroy() {
    if (!this.conversaSubscription) { return; }
    this.conversaSubscription.unsubscribe();
  }

  inicializar() {
    this.conversaSubscription = this.conversaHandleService
      .conversaSelecionada()
      .subscribe((conversa) => {
        this.conversa = conversa;
        this.obterMensagens(conversa.conversaId);
    });
  }

  obterMensagens(conversaId: number) {
    this.filtro = new MensagemFiltro(conversaId);
    this.mensagemService.obterMensagens(this.filtro)
      .subscribe(res => {
        this.resultado = res as Resultado<Mensagem>;
      });
  }
}
