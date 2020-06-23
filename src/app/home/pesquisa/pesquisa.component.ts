import { AutenticacaoService } from './../../autenticacao/services/autenticacao.service';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaSubjectsService } from '../services/conversa-subjects.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html'
})
export class PesquisaComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('pesquisa') pesquisa: ElementRef;
  contatoLogado: Contato;
  esconderResultados = true;

  constructor(
    private conversaService: ConversaSubjectsService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.conversaService
      .receberEsconderResultados()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberEsconderResultados(res));

    this.conversaService
      .receberAtualizarResultados()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.pesquisar());
  }

  pesquisar() {
    if(!this.ehElegivelParaPesquisar()) {
      this.esconderResultados = true;
      this.conversaService.limparPesquisa();
      return;
    }

    this.esconderResultados = false;
    this.conversaService.pesquisarConversas(this.criarFiltroDaPesquisa());
  }

  ehElegivelParaPesquisar() {
    return this.pesquisa.nativeElement.innerText &&
      this.pesquisa.nativeElement.innerText.trim() !== '';
  }

  receberEsconderResultados(res) {
    this.pesquisa.nativeElement.innerText = '';
    this.esconderResultados = res;
    this.conversaService.limparPesquisa();
  }

  criarFiltroDaPesquisa() {
    return {
      contatoLogadoId: this.contatoLogado.contatoId,
      textoPesquisa: this.pesquisa.nativeElement.innerText.trim().toLowerCase()
    };
  }
}
