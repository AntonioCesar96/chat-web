import { Contato } from './../../_common/models/contato.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.component.html'
})
export class ConversaComponent implements OnInit {
  contato: Contato;

  constructor(
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contato = this.autenticacaoService.getContatoLogado();
  }
}
