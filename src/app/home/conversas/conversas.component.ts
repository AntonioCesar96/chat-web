import { Contato } from '../../_common/models/contato.model';
import { AutenticacaoService } from '../../autenticacao/services/autenticacao.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-conversas',
  templateUrl: './conversas.component.html'
})
export class ConversasComponent implements OnInit {
  contatoLogado: Contato;

  constructor(
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }
}
