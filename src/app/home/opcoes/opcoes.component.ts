import { Component, OnInit } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';

@Component({
  selector: 'app-opcoes',
  templateUrl: './opcoes.component.html'
})
export class OpcoesComponent implements OnInit {
  contatoLogado: Contato;

  constructor(
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

}
