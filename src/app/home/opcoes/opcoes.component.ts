import { SignalRService } from '../services/signalr.service';
import { Router } from '@angular/router';
import { ConversaSubjectsService } from './../services/conversa-subjects.service';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';

@Component({
  selector: 'app-opcoes',
  templateUrl: './opcoes.component.html'
})
export class OpcoesComponent implements OnInit {
  @ViewChild('maisOpcoes') maisOpcoes: ElementRef;
  @ViewChild('botaoMaisOpcoes') botaoMaisOpcoes: ElementRef;
  contatoLogado: Contato;
  mostrarMaisOpcoes = false;

  constructor(
    private router: Router,
    private conversaSubjectsService: ConversaSubjectsService,
    private signalRService: SignalRService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();
  }

  abrirPerfil() {
    this.mostrarMaisOpcoes = false;
    this.conversaSubjectsService.mostrarPerfil(true);
  }

  abrirContatos() {
    this.conversaSubjectsService.mostrarNovaConversa(true);
  }

  abrirMaisOpcoes() {
    this.mostrarMaisOpcoes = !this.mostrarMaisOpcoes;
  }

  @HostListener('document:click', ['$event.path'])
  public onGlobalClick(targetElementPath: Array<any>) {
    const list = [ this.maisOpcoes.nativeElement, this.botaoMaisOpcoes.nativeElement ];
    const elementRefInPath = targetElementPath.find(e => list.includes(e));
    if (!elementRefInPath) {
      this.mostrarMaisOpcoes = false;
    }
  }

  sair() {
    this.mostrarMaisOpcoes = false;
    this.signalRService.desconectar();
    localStorage.removeItem('access_token');
    this.router.navigate([`/entrar`]);
  }
}
