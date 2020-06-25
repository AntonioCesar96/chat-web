import { LoginService } from './../../autenticacao/services/login.service';
import { SignalRService } from '../services/signalr.service';
import { Router } from '@angular/router';
import { ConversaSubjectsService } from './../services/conversa-subjects.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';

@Component({
  selector: 'app-opcoes',
  templateUrl: './opcoes.component.html'
})
export class OpcoesComponent implements OnInit {
  contatoLogado: Contato;
  mostrarMaisOpcoes = false;

  constructor(
    private router: Router,
    private conversaSubjectsService: ConversaSubjectsService,
    private signalRService: SignalRService,
    private autenticacaoService: AutenticacaoService,
    private loginService: LoginService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

  abrirPerfil() {
    this.mostrarMaisOpcoes = false;
    this.conversaSubjectsService.mostrarPerfil(true);
  }

  abrirMaisOpcoes() {
    this.mostrarMaisOpcoes = !this.mostrarMaisOpcoes;
  }

  sair() {
    this.mostrarMaisOpcoes = false;
    this.signalRService.desconectar();
    localStorage.removeItem('access_token');
    this.router.navigate([`/entrar`]);
  }
}
