import { ConversaService } from './../../services/conversa.service';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaFiltro } from './../../../_common/models/conversa.filtro';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { SignalRService } from './../../../_common/services/signalr.service';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lista-conversas',
  templateUrl: './lista-conversas.component.html'
})
export class ListaConversasComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() contatoLogado: Contato;
  @Output() criarComponente = new EventEmitter<UltimaConversa>();
  filtro: ConversaFiltro;

  constructor(
    public conversaService: ConversaService,
    private conversaSubjectsService: ConversaSubjectsService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
    this.obterConversasDoContato(this.contatoLogado.contatoId);
  }

  inicializar() {
    this.signalRService
      .receberMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberMensagem(mensagem));

    this.signalRService
      .receberPrimeiraMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberPrimeiraMensagem(mensagem));

    this.signalRService
      .receberContatoDigitando()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.validarContatoQueEstaDigitando(res));

    this.signalRService
      .receberMensagemLida()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.marcarMensagemComoLida(mensagem));

    this.signalRService
      .receberConversasDoContato()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberConversasDoContato(res));

    this.conversaSubjectsService
      .receberAtualizarContatosParaFechados()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.conversaService.fecharConversas());
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    this.conversaService.marcarMensagemComoLida(mensagem);
  }

  validarContatoQueEstaDigitando(res) {
    this.conversaService.validarContatoQueEstaDigitando(res);
  }

  receberConversasDoContato(res: Resultado<UltimaConversa>) {
    this.conversaService.atualizarVariavelUltimasConversas(res);
  }

  obterConversasDoContato(contatoId: number) {
    this.filtro = new ConversaFiltro(contatoId);
    this.signalRService.obterConversasDoContato(this.filtro);
  }

  existeConversas() {
    return this.conversaService.obterUltimasConversas().total > 0;
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaService.fecharConversas();
    conversa.conversaAberta = true;
    this.conversaSubjectsService.abrirConversaSelecionada(conversa);
  }

  receberPrimeiraMensagem(mensagem: Mensagem) {
    const conversaNova = this.conversaService.criarConversaPrimeiraMensagem(mensagem, this.contatoLogado);

    this.conversaService.adicionarConversa(conversaNova);
    this.conversaService.ordenarConversas();

    this.conversaSubjectsService.abrirPrimeiraConversa(conversaNova);

    if(this.contatoLogado.contatoId !== mensagem.contatoRemetenteId) {
      this.conversaSubjectsService.atualizarResultados();
    }
  }

  receberMensagem(mensagem: Mensagem) {
    this.conversaService.receberMensagem(mensagem, this.contatoLogado);

    if(this.contatoLogado.contatoId !== mensagem.contatoRemetenteId) {
      this.conversaSubjectsService.atualizarResultados();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

