import { SignalRService } from './../../../_common/services/signalr-events.service';
import { Component, OnInit, OnDestroy, Input, ViewChild,
  ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaService } from '../../services/conversa.service';
import * as moment from 'moment';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lista-mensagens',
  templateUrl: './lista-mensagens.component.html'
})
export class ListaMensagensComponent implements OnInit, OnDestroy, AfterViewInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  receberMensagemSub: Subscription;
  receberMensagensSub: Subscription;
  receberMensagemLidaSub: Subscription;
  conversaSelecionadaSub: Subscription;

  @Input() contatoLogado: Contato;
  @ViewChild('mensagem') mensagem: ElementRef;
  @ViewChildren('mensagemNova') mensagemNova: QueryList<any>;
  @ViewChildren('mensagemLista') viewsMensagemLista: QueryList<any>;

  filtro: MensagemFiltro;
  resultado: Resultado<Mensagem>;
  ultimaConversa: UltimaConversa;
  manterScrollTop = false;
  buscandoMensagens = false;
  ultimaPagina = false;
  scrollHeightOld = 0;

  constructor(
    private conversaService: ConversaService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
  }

  ngAfterViewInit() {
    this.viewsMensagemLista.changes.subscribe(t => this.viewsMensagemRenderizadas());
    this.mensagemNova.changes.subscribe(t => this.mensagemNovaRenderizada());
  }

  inicializar() {
    this.conversaSelecionadaSub =  this.conversaService
      .conversaSelecionada()
      // .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.selecionarConversa(conversa));

    this.receberMensagemSub = this.signalRService
      .receberMensagem()
      // .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberMensagem(mensagem));

    this.receberMensagemLidaSub = this.signalRService
      .receberMensagemLida()
      // .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.marcarMensagemComoLida(mensagem));

    this.receberMensagensSub = this.signalRService
      .receberMensagens()
      // .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberMensagens(res));
  }

  viewsMensagemRenderizadas() {
    const elemento = this.mensagem.nativeElement;
    if(this.manterScrollTop) {
      elemento.scrollTop = elemento.scrollTop + (elemento.scrollHeight - this.scrollHeightOld);
      return;
    }

    if(this.obterMensagemNova()) { return; }
    elemento.scrollTop = elemento.scrollHeight - elemento.offsetHeight;
  }

  mensagemNovaRenderizada() {
    if(!this.manterScrollTop && this.obterMensagemNova() && this.mensagemNova.first) {
      const elemento = this.mensagemNova.first;
      this.mensagem.nativeElement.scrollTop = elemento.nativeElement.offsetTop - 130;
    }
  }

  selecionarConversa(conversa: UltimaConversa) {
    this.ultimaConversa = conversa;
    this.inicializarVariaveis()
    this.criarListaInicial();
    this.criarFiltro(conversa.conversaId);
    this.obterMensagens();
  }

  receberMensagens(res: Resultado<Mensagem>) {
    this.buscandoMensagens = false;
    this.resultado.total = res.total;
    this.ultimaPagina = this.resultado.lista.length === this.resultado.total;

    if(this.manterScrollTop) {
      this.resultado.lista.push(...res.lista);
      this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
      this.ordenarMensagens();
      return;
    }

    this.resultado = res;
    this.filtro.primeiraBusca = false;
    this.marcarMensagemNova();
    this.ordenarMensagens();
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    if(!this.ultimaConversa || this.ultimaConversa.conversaId !== mensagem.conversaId) {
      return;
    }

    this.resultado.lista
      .filter(x => (mensagem.mensagemId !== 0 && x.mensagemId === mensagem.mensagemId)
        || (mensagem.mensagemId === 0 && x.conversaId === mensagem.conversaId))
      .forEach(x => x.statusMensagem = StatusMensagem.Lida);
  }

  receberMensagem(mensagem: Mensagem) {
    if(!this.ultimaConversa ||
        this.ultimaConversa.conversaId !== mensagem.conversaId) {
      return;
    }

    this.resultado.lista.push(mensagem);
    this.filtro.qtdMensagensPular++;
    this.resultado.total++;
    this.manterScrollTop = false;
    this.ordenarMensagens();
    this.desmarcarMensagemNova();

    if(this.contatoLogado.contatoId === mensagem.contatoDestinatarioId) {
      this.signalRService.marcarMensagemComoLida(mensagem.mensagemId,
        mensagem.conversaId, mensagem.contatoRemetenteId);
    }
  }

  inicializarVariaveis() {
    this.manterScrollTop = false;
    this.buscandoMensagens = false;
    this.ultimaPagina = false;
  }

  ehIgualAoContatoLogado(item: Mensagem) {
    return item.contatoRemetenteId === this.contatoLogado.contatoId;
  }

  criarListaInicial() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId =  this.ultimaConversa.contatoRemetenteId;
    mensagem.contatoDestinatarioId =  this.ultimaConversa.contatoDestinatarioId;
    mensagem.dataEnvio =  this.ultimaConversa.dataEnvio;
    mensagem.mensagemEnviada =  this.ultimaConversa.ultimaMensagem;
    mensagem.statusMensagem =  this.ultimaConversa.statusUltimaMensagem;

    this.resultado = new Resultado<Mensagem>();
    this.resultado.lista = [ mensagem ];

    this.ordenarMensagens();
  }

  criarFiltro(conversaId: number) {
    this.filtro = new MensagemFiltro(conversaId, this.ultimaConversa.qtdMensagensNovas);
  }

  obterMensagens() {
    this.buscandoMensagens = true;
    this.signalRService.obterMensagens(this.filtro);
  }

  marcarMensagemNova() {
    this.ultimaConversa.conversaAberta = true;
    if(this.ultimaConversa.qtdMensagensNovas === 0) { return; }

    const naoLidas = this.resultado.lista.filter(x => x.statusMensagem !== StatusMensagem.Lida);
    naoLidas[0].qtdMensagensNovas = this.ultimaConversa.qtdMensagensNovas;

    this.ultimaConversa.qtdMensagensNovas = 0;
    this.ultimaConversa.mostrarMensagensNovas = false;

    this.signalRService.marcarMensagemComoLida(0, this.ultimaConversa.conversaId,
      this.ultimaConversa.contatoAmigoId);
  }

  desmarcarMensagemNova() {
    const mensagem = this.obterMensagemNova();
    if(!mensagem) { return; }

    mensagem.qtdMensagensNovas = 0;
  }

  obterMensagemNova() {
    return this.resultado.lista.find(x => x.qtdMensagensNovas > 0);
  }

  ordenarMensagens() {
    this.resultado.lista.sort((m1,m2) =>
      new Date(m1.dataEnvio).getTime() - new Date(m2.dataEnvio).getTime());

    this.resultado.lista.map(x => new Date(x.dataEnvio).toDateString())
      .filter((item, i, ar) => ar.indexOf(item) === i)
      .sort((d1,d2) => new Date(d1).getTime() - new Date(d2).getTime())
      .forEach(data => {
        const mensagens = this.resultado.lista.filter(x => new Date(x.dataEnvio).toDateString() === data);
        mensagens.forEach(x => delete x.dataDescricao);
        mensagens[0].dataDescricao = this.obterDataKey(new Date(data));
    });
  }

  obterDataKey(data: Date) {
    const diferencaEmDias = moment().diff(moment(data), 'days');
    let dataDescricao = moment(data).format('L');

    if (diferencaEmDias < 2) {
      dataDescricao = moment(data).calendar(null, {
        lastDay : '[ontem]',
        sameDay : '[hoje]',
      })
    } else if (diferencaEmDias < 7) {
      dataDescricao = moment(data).format('dddd');
    }

    return dataDescricao;
  }

  onScroll(target) {
    this.scrollHeightOld = target.scrollHeight;
    if (!this.ultimaPagina && !this.buscandoMensagens) {
      const comecoTela = target.scrollTop - 100;

      if (comecoTela <= 0) {
        this.obterMensagensPaginado();
      }
    }
  }

  obterMensagensPaginado() {
    this.filtro.pagina++;
    this.manterScrollTop = true;
    this.buscandoMensagens = true;
    this.signalRService.obterMensagens(this.filtro);
  }

  ngOnDestroy() {
    // this.destroy$.next(true);
    // this.destroy$.unsubscribe();

    if(this.conversaSelecionadaSub) { this.conversaSelecionadaSub.unsubscribe() }
    if(this.receberMensagemSub) { this.receberMensagemSub.unsubscribe() }
    if(this.receberMensagensSub) { this.receberMensagensSub.unsubscribe() }
    if(this.receberMensagemLidaSub) { this.receberMensagemLidaSub.unsubscribe() }
  }
}
