import { ListaAmigos } from './../../../_common/models/lista-amigos.model';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { SignalRService } from '../../services/signalr.service';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pesquisa-contatos',
  templateUrl: './pesquisa-contatos.component.html'
})
export class PesquisaContatosComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Output() avisarSeEncontrouAlgumContato = new EventEmitter<boolean>();
  @Input() contatoLogado: Contato;
  resultado: Resultado<ListaAmigos>;

  constructor(
    private signalRService: SignalRService,
    private conversaService: ConversaSubjectsService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.signalRService
      .receberContatosAmigosPesquisa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberContatosAmigosPesquisa(res));

    this.conversaService
      .receberPesquisaContatos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberPesquisa(res));

    this.conversaService
      .receberLimparPesquisa()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resultado = null);
  }

  receberPesquisa(filtro) {
    this.signalRService.obterContatosAmigosPesquisa(filtro);
  }

  receberContatosAmigosPesquisa(res: Resultado<ListaAmigos>) {
    this.resultado = res;
    this.avisarSeEncontrouAlgumContato.emit(res.lista.length > 0);
  }

  existeContatos() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  public selecionarContato(contatoAmigo: ListaAmigos) {
    this.conversaService.atualizarContatosParaFechados();
    this.conversaService.abrirContatoSelecionado(contatoAmigo);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
