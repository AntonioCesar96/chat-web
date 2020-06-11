import { Contato } from './../../_common/models/contato.model';
import { ConversaHandleService } from './../services/conversa-handle.service';
import { Conversa } from './../../_common/models/conversa.model';
import { Resultado } from './../../_common/models/resultado.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { ConversaFiltro } from './../../_common/models/conversa.filtro';
import { ConversaService } from '../services/conversa.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lista-conversas',
  templateUrl: './lista-conversas.component.html',
  styleUrls: ['./lista-conversas.component.scss']
})
export class ListaConversasComponent implements OnInit {
  filtro: ConversaFiltro;
  contato: Contato;
  resultado: Resultado<Conversa>;

  constructor(
    private conversaService: ConversaService,
    private conversaHandleService: ConversaHandleService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }

    this.obterContatoLogado();
    this.obterConversasDoContato(this.contato.contatoId);
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.conversaService.obterConversasDoContato(this.filtro)
      .subscribe(res => {
        this.resultado = res as Resultado<Conversa>;
      });
  }

  obterContatoLogado() {
    this.contato = this.autenticacaoService.getContatoLogado();
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  public selecionarConversa(conversa: Conversa) {
    this.conversaHandleService.selecionarConversa(conversa);
  }
}
