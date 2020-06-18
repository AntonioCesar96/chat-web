import { ConversaService } from './../../../services/conversa.service';
import { SignalRService } from './../../../../_common/services/signalr.service';
import { Resultado } from 'src/app/_common/models/resultado.model';
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
  resultado: Resultado<UltimaConversa>;

  constructor(
    private signalRService: SignalRService,
    private conversaService: ConversaService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.signalRService
      .receberConversasDoContatoPesquisa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberConversasDoContato(res));

    this.conversaService
      .receberPesquisaConversas()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberPesquisa(res));
  }

  receberPesquisa(res) {
    this.filtro = new ConversaFiltro(res.contatoLogadoId, res.textoPesquisa);
    this.signalRService.obterConversasDoContatoPesquisa(this.filtro);
  }

  receberConversasDoContato(res: Resultado<UltimaConversa>) {
    this.resultado = res;
    this.resultado.lista.forEach(conversa => conversa.conversaAberta = false);

    this.conversaService.pesquisarContatos(this.obterFiltroDaPesquisa());
  }

  obterFiltroDaPesquisa() {
    return {
      contatoLogadoId: this.contatoLogado.contatoId,
      textoPesquisa: this.filtro.nomeContato,
      contatosIdsParaIgnorar: this.resultado.lista.map(x => x.contatoAmigoId)
    };
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  ordenarConversas() {
    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.resultado.lista.forEach(x => x.conversaAberta = false);
    this.conversaService.selecionarConversa(conversa);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
