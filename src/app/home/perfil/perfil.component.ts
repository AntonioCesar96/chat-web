import { SignalRService } from '../services/signalr.service';
import { ConversaService } from './../services/conversa.service';
import { ConversaSubjectsService } from './../services/conversa-subjects.service';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('campoNome') campoNome: ElementRef;
  @ViewChild('campoRecado') campoRecado: ElementRef;
  contatoLogado: Contato;
  editandoCampoNome = false;
  editandoCampoRecado = false;

  constructor(
    private conversaSubjectsService: ConversaSubjectsService,
    private signalRService: SignalRService,
    private autenticacaoService: AutenticacaoService,
    private toastr: ToastrService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.conversaSubjectsService
      .receberMostrarPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarPerfil(mostrar));
  }

  receberMostrarPerfil(mostrar) {
    if(!mostrar) { return; }

    this.campoNome.nativeElement.innerText = this.contatoLogado.nome;
    this.campoRecado.nativeElement.innerText = this.contatoLogado.descricao;
  }

  fecharPerfil() {
    this.editandoCampoNome = false;
    this.editandoCampoRecado = false;
    this.conversaSubjectsService.mostrarPerfil(false);
  }

  editarCampoNome() {
    this.editandoCampoNome = true;
  }

  salvarCampoNome() {
    if(!this.ehElegivelParaAlterarNome()) {
      this.toastr.show('Nome deve ser preenchido!');
      return;
    }

    this.editandoCampoNome = false;
    this.contatoLogado.nome = this.campoNome.nativeElement.innerText.trim();
    this.signalRService.atualizarDadosContato(this.contatoLogado);
  }

  enterSalvarCampoNome(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.salvarCampoNome();
      return false;
    }
  }

  editarCampoRecado() {
    this.editandoCampoRecado = true;
  }

  salvarCampoRecado() {
    this.editandoCampoRecado = false;
    this.contatoLogado.descricao = this.campoRecado.nativeElement.innerText.trim();
    this.signalRService.atualizarDadosContato(this.contatoLogado);
  }

  enterSalvarCampoRecado(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.salvarCampoRecado();
      return false;
    }
  }

  ehElegivelParaAlterarNome() {
    return this.campoNome.nativeElement.innerText &&
      this.campoNome.nativeElement.innerText.trim() !== ''
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
