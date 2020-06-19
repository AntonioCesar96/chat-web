import { ConversaService } from './../../../services/conversa.service';
import { ConversaSubjectsService } from '../../../services/conversa-subjects.service';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaFiltro } from './../../../../_common/models/conversa.filtro';
import { Contato } from 'src/app/_common/models/contato.model';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pesquisa-conversas',
  templateUrl: './pesquisa-conversas.component.html'
})
export class PesquisaConversasComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() contatoLogado: Contato;
  filtro: ConversaFiltro;
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
  }

  receberPesquisa(res) {
    this.filtro = new ConversaFiltro(res.contatoLogadoId, res.textoPesquisa);

    this.resultadoPesquisa = this.conversaService.obterUltimasConversasLista()
      .filter(x => x.nome.toLocaleLowerCase().includes(res.textoPesquisa))

    this.conversaSubjectsService.pesquisarContatos(this.obterFiltroDaPesquisa());
  }

  obterFiltroDaPesquisa() {
    return {
      contatoLogadoId: this.contatoLogado.contatoId,
      textoPesquisa: this.filtro.nomeContato,
      contatosIdsParaIgnorar: this.conversaService.obterUltimasConversasLista()
        .map(x => x.contatoAmigoId)
    };
  }

  existeConversas() {
    return !!this.resultadoPesquisa && this.resultadoPesquisa.length > 0;
  }

  ordenarConversas() {
    this.conversaService.obterUltimasConversasLista().sort((n1,n2) =>
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
