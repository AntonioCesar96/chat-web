import { ListaAmigos } from './../../_common/models/lista-amigos.model';
import { SignalRService } from './../services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaSubjectsService } from '../services/conversa-subjects.service';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-novo-contato',
  templateUrl: './novo-contato.component.html'
})
export class NovoContatoComponent implements OnInit, OnDestroy {
  @ViewChild('campoEmail') campoEmail: ElementRef;
  destroy$: Subject<boolean> = new Subject<boolean>();
  contatoLogado: Contato;

  constructor(
    private conversaSubjectsService: ConversaSubjectsService,
    private autenticacaoService: AutenticacaoService,
    private signalRService: SignalRService,
    private toastr: ToastrService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.conversaSubjectsService
      .receberMostrarNovoContato()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarNovoContato(mostrar));

    this.signalRService
      .receberAdicionarContatoAmigo()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberAdicionarContatoAmigo(res));
  }

  receberAdicionarContatoAmigo(res: any) {
    if (res.erros && res.erros.length > 0) {
      this.toastr.show(res.erros[0])
      return;
    }

    this.toastr.show('Contato adicionado aos amigos!');
    this.conversaSubjectsService.atualizarContatosParaFechados();
    this.conversaSubjectsService.abrirContatoSelecionado(res as ListaAmigos);
    this.fecharNovoContato();
  }

  receberMostrarNovoContato(mostrar) {
    if(!mostrar) { return; }

    this.campoEmail.nativeElement.innerText = '';
    this.campoEmail.nativeElement.focus();
  }

  fecharNovoContato() {
    this.conversaSubjectsService.mostrarNovoContato(false);
  }

  enterCampoEmail(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.pesquisarContato();
      return false;
    }
  }

  pesquisarContato() {
    if(!this.ehElegivelParaPesquisar()) {
      this.toastr.show('Email deve ser preenchido!');
      return;
    }

    const res = this.criarObjetoParaAdicionarAmigo();
    this.signalRService.adicionarContatoAmigo(res);
  }

  criarObjetoParaAdicionarAmigo() {
    return {
      contatoPrincipalId: this.contatoLogado.contatoId,
      emailAmigo: this.obterTextoPesquisado().trim()
    };
  }

  ehElegivelParaPesquisar() {
    return this.obterTextoPesquisado() && this.obterTextoPesquisado().trim() !== '';
  }

  obterTextoPesquisado() {
    return this.campoEmail.nativeElement.innerText;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
