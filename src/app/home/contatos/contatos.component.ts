import { ConversaService } from './../services/conversa.service';
import { ListaAmigos } from './../../_common/models/lista-amigos.model';
import { Resultado } from './../../_common/models/resultado.model';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaSubjectsService } from '../services/conversa-subjects.service';
import { SignalRService } from '../services/signalr.service';
import { AutenticacaoService } from 'src/app/autenticacao/services/autenticacao.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contatos',
  templateUrl: './contatos.component.html'
})
export class ContatosComponent implements OnInit, OnDestroy {
  @ViewChild('pesquisa') pesquisa: ElementRef;
  destroy$: Subject<boolean> = new Subject<boolean>();
  contatoLogado: Contato;
  pesquisando = false;
  encontrouAlgumContato = false;
  nomeContatoPesquisado;
  resultado: Resultado<ListaAmigos>;
  contatos: ListaAmigos[];

  constructor(
    private conversaSubjectsService: ConversaSubjectsService,
    private conversaService: ConversaService,
    private signalRService: SignalRService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.conversaSubjectsService
      .receberMostrarNovaConversa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mostrar) => this.receberMostrarNovaConversa(mostrar));

    this.signalRService
      .receberTodosOsContatosAmigos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberContatosAmigosPesquisa(res));
  }

  receberContatosAmigosPesquisa(res: Resultado<ListaAmigos>) {
    this.resultado = res;
    this.limparPesquisa();
  }

  receberMostrarNovaConversa(mostrar) {
    if(!mostrar) { return; }
    const filtro = this.criarFiltroParaBuscarContatos();
    this.signalRService.obterTodosOsContatosAmigos(filtro);
  }

  fecharContatos() {
    this.conversaSubjectsService.mostrarNovaConversa(false);
  }

  pesquisar() {
    this.nomeContatoPesquisado = this.obterTextoPesquisado();
    if(!this.ehElegivelParaPesquisar()) {
      this.pesquisando = false;
      return;
    }

    this.filtrarContatos(this.obterTextoPesquisado().trim());
    this.pesquisando = true;
  }

  filtrarContatos(nomeContato: string) {
    this.contatos = this.resultado.lista.filter(x => x.nomeAmigo.toLowerCase().includes(nomeContato));
    this.definirSeEncontrouAlgumResultado();
  }

  ehElegivelParaPesquisar() {
    return this.obterTextoPesquisado() && this.obterTextoPesquisado().trim() !== '';
  }

  limparPesquisa() {
    this.pesquisa.nativeElement.innerText = '';
    this.pesquisando = false;
    this.contatos = this.resultado.lista;
    this.definirSeEncontrouAlgumResultado();
  }

  definirSeEncontrouAlgumResultado() {
    this.encontrouAlgumContato = this.contatos.length > 0;
  }

  obterTextoPesquisado() {
    return this.pesquisa.nativeElement.innerText;
  }

  criarFiltroParaBuscarContatos() {
    return {
      contatoPrincipalId: this.contatoLogado.contatoId,
      contatosIdsParaIgnorar: []
    };
  }

  public selecionarContato(contatoAmigo: ListaAmigos) {
    this.conversaSubjectsService.atualizarContatosParaFechados();
    this.fecharContatos();

    const amigo = this.conversaService.obterConversaPorContatoAmigoId(contatoAmigo.contatoAmigoId);
    if(amigo) {
      this.conversaSubjectsService.abrirConversaSelecionada(amigo);
      return;
    }

    this.conversaSubjectsService.abrirContatoSelecionado(contatoAmigo);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
