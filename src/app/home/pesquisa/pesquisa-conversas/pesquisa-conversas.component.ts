import { ConversaService } from './../../services/conversa.service';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pesquisa-conversas',
  templateUrl: './pesquisa-conversas.component.html'
})
export class PesquisaConversasComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Output() avisarSeEncontrouAlgumaConversa = new EventEmitter<boolean>();
  @Input() contatoLogado: Contato;
  resultadoPesquisa: UltimaConversa[];

  constructor(
    private conversaService: ConversaService,
    private conversaSubjectsService: ConversaSubjectsService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.conversaSubjectsService
      .receberPesquisaConversas()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberPesquisa(res));

    this.conversaSubjectsService
      .receberLimparPesquisa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.resultadoPesquisa = null);
  }

  receberPesquisa(filtro) {
    this.filtrarConversas(filtro.textoPesquisa);
    this.conversaSubjectsService.pesquisarContatos(this.criarFiltroParaBuscarContatos(filtro));
  }

  filtrarConversas(nomeContato: string) {
    this.resultadoPesquisa = this.conversaService.obterUltimasConversasLista()
      .filter(x => x.nome.toLowerCase().includes(nomeContato));

    this.avisarSeEncontrouAlgumaConversa.emit(this.resultadoPesquisa.length > 0);
  }

  criarFiltroParaBuscarContatos(filtro) {
    return {
      contatoPrincipalId: this.contatoLogado.contatoId,
      nomeAmigo: filtro.textoPesquisa,
      contatosIdsParaIgnorar: this.resultadoPesquisa.map(x => x.contatoAmigoId)
    };
  }

  existeConversas() {
    return !!this.resultadoPesquisa && this.resultadoPesquisa.length > 0;
  }

  ordenarConversas() {
    this.resultadoPesquisa.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaService.fecharConversas();
    conversa.conversaAberta = true;
    this.conversaSubjectsService.abrirConversaSelecionada(conversa);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
