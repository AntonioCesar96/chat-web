import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
  @Output() mostrarSessaoPerfil = new EventEmitter<boolean>();
  contatoLogado: Contato;

  constructor(
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

  fecharPerfil() {
    this.mostrarSessaoPerfil.emit(false);
  }

}
