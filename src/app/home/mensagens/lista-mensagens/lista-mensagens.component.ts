import { StringResources } from 'src/app/string-resources';
import { SignalRService } from './../../../_common/services/signalr.service';
import { Component, OnInit, OnDestroy, Input, ViewChild,
  ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import * as moment from 'moment';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lista-mensagens',
  templateUrl: './lista-mensagens.component.html'
})
export class ListaMensagensComponent implements OnInit, OnDestroy, AfterViewInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() contatoLogado: Contato;
  @ViewChild('mensagem') mensagem: ElementRef;
  @ViewChildren('mensagemNova') mensagemNova: QueryList<any>;
  @ViewChildren('mensagemPorData') viewsMensagemData: QueryList<any>;

  filtro: MensagemFiltro;
  resultado: Resultado<Mensagem>;
  mensagensPorData: Map<any, Mensagem[]>;
  conversaAtual: UltimaConversa;
  manterScrollTop = false;
  buscandoMensagens = false;
  ultimaPagina = false;
  scrollHeightOld = 0;

  constructor(
    private conversaService: ConversaSubjectsService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    this.inicializar();
  }

  ngAfterViewInit() {
    this.viewsMensagemData.changes.subscribe(t => this.onMensagensRenderizadas());
    this.mensagemNova.changes.subscribe(t => this.onMensagemNovaRenderizada());
  }

  inicializar() {
    this.conversaService
      .receberConversaSelecionadaMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.abrirConversaSelecionadaMensagem(conversa));

    this.conversaService
      .receberContatoSelecionadoMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.abrirContatoSelecionadoMensagem(conversa));

    this.conversaService
      .receberPrimeiraConversaMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.abrirPrimeiraConversaMensagem(conversa));

    this.signalRService
      .receberMensagem()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.receberMensagem(mensagem));

    this.signalRService
      .receberMensagemLida()
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagem) => this.marcarMensagemComoLida(mensagem));

    this.signalRService
      .receberMensagens()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberMensagens(res));
  }

  abrirConversaSelecionadaMensagem(conversa: UltimaConversa) {
    this.conversaAtual = conversa;
    conversa.conversaAberta = true;
    this.inicializarVariaveis();
    this.criarFiltro(conversa.conversaId);
    this.criarListaInicial();
    this.obterMensagens();
  }

  abrirContatoSelecionadoMensagem(conversa: UltimaConversa) {
    this.conversaAtual = conversa;
    this.inicializarVariaveis();
  }

  abrirPrimeiraConversaMensagem(conversa: UltimaConversa) {
    if(!this.ehElegivelParaPrimeiraConversa(conversa)) { return; }

    this.conversaAtual = conversa;
    conversa.conversaAberta = true;
    this.inicializarVariaveis();
    this.criarFiltro(conversa.conversaId);
    this.criarListaInicial();
    this.avisarQueAsMensagensForamLidas();
  }

  ehElegivelParaPrimeiraConversa(conversa: UltimaConversa) {
    return this.conversaAtual && this.conversaAtual.conversaId === 0
      && conversa.contatoAmigoId === this.conversaAtual.contatoAmigoId
  }

  onMensagensRenderizadas() {
    const elemento = this.mensagem.nativeElement;
    if(this.manterScrollTop) {
      elemento.scrollTop = elemento.scrollTop + (elemento.scrollHeight - this.scrollHeightOld);
      return;
    }

    if(this.obterMensagemQueEstaMarcadaComQtdDeMensagensNovas()) { return; }
    elemento.scrollTop = elemento.scrollHeight - elemento.offsetHeight;
  }

  onMensagemNovaRenderizada() {
    if(!this.ehElegivelParaMensagemNovaRenderizada()) { return; }

    const elemento = this.mensagemNova.first;
    this.mensagem.nativeElement.scrollTop = elemento.nativeElement.offsetTop - 130;
  }

  ehElegivelParaMensagemNovaRenderizada() {
    return !this.manterScrollTop && this.obterMensagemQueEstaMarcadaComQtdDeMensagensNovas()
      && this.mensagemNova.first;
  }

  receberMensagens(res: Resultado<Mensagem>) {
    if(!this.ehElegivelParaReceberMensagens(res)) { return; }

    if(this.manterScrollTop) {
      this.receberMensagensBuscaPaginada(res);
      return;
    }

    this.receberMensagensPrimeiraBusca(res);
  }

  receberMensagensPrimeiraBusca(res: Resultado<Mensagem>) {
    this.buscandoMensagens = false;
    this.resultado.total = res.total;
    this.resultado = res;
    this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
    this.filtro.primeiraBusca = false;
    this.avisarQueAsMensagensForamLidas();
    this.criarMapComMensagensOrdenadasPorData();
  }

  receberMensagensBuscaPaginada(res: Resultado<Mensagem>) {
    this.buscandoMensagens = false;
    this.resultado.total = res.total;
    this.resultado.lista.push(...res.lista);
    this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
    this.criarMapComMensagensOrdenadasPorData();
  }

  ehElegivelParaReceberMensagens(res: Resultado<Mensagem>) {
    return this.conversaAtual && res.lista.length > 0
      && this.conversaAtual.conversaId === res.lista[0].conversaId;
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    if(!this.mensagemRecebidaEhDaConversaAtual(mensagem)) { return; }

    this.marcarMensagensDaListaLidas(mensagem);
  }

  marcarMensagensDaListaLidas(mensagem: Mensagem) {
    this.resultado.lista
      .filter(x => (mensagem.mensagemId !== 0 && x.mensagemId === mensagem.mensagemId)
        || (mensagem.mensagemId === 0 && x.conversaId === mensagem.conversaId))
      .forEach(x => x.statusMensagem = StatusMensagem.Lida);
  }

  receberMensagem(mensagem: Mensagem) {
    if(!this.mensagemRecebidaEhDaConversaAtual(mensagem)) { return; }

    this.adicionarMensagemNovaNaLista(mensagem);
    this.avisarQueMensagemFoiLida(mensagem);
  }

  mensagemRecebidaEhDaConversaAtual(mensagem: Mensagem) {
    return this.conversaAtual && this.conversaAtual.conversaId === mensagem.conversaId;
  }

  avisarQueMensagemFoiLida(mensagem: Mensagem) {
    if(this.contatoLogado.contatoId === mensagem.contatoDestinatarioId) {
      this.signalRService.marcarMensagemComoLida(mensagem.mensagemId,
        mensagem.conversaId, mensagem.contatoRemetenteId);
    }
  }

  adicionarMensagemNovaNaLista(mensagem: Mensagem) {
    this.resultado.lista.push(mensagem);
    this.filtro.qtdMensagensPular++;
    this.resultado.total++;
    this.manterScrollTop = false;
    this.criarMapComMensagensOrdenadasPorData();
    this.desmarcarMensagemQuePossuiQuantitativoDeMensagensNovas();
  }

  inicializarVariaveis() {
    this.manterScrollTop = false;
    this.buscandoMensagens = false;
    this.ultimaPagina = true;
    this.resultado = null;
    this.mensagensPorData = null;
  }

  ehIgualAoContatoLogado(item: Mensagem) {
    return item.contatoRemetenteId === this.contatoLogado.contatoId;
  }

  criarListaInicial() {
    const mensagem = this.criarPrimeiraMensagem();

    this.resultado = new Resultado<Mensagem>();
    this.resultado.lista = [ mensagem ];

    this.criarMapComMensagensOrdenadasPorData();
  }

  criarPrimeiraMensagem() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.conversaAtual.conversaId;
    mensagem.contatoRemetenteId =  this.conversaAtual.contatoRemetenteId;
    mensagem.contatoDestinatarioId =  this.conversaAtual.contatoDestinatarioId;
    mensagem.dataEnvio =  this.conversaAtual.dataEnvio;
    mensagem.mensagemEnviada =  this.conversaAtual.ultimaMensagem;
    mensagem.statusMensagem =  this.conversaAtual.statusUltimaMensagem;

    return mensagem;
  }

  criarFiltro(conversaId: number) {
    this.filtro = new MensagemFiltro(conversaId, this.conversaAtual.qtdMensagensNovas);
  }

  avisarQueAsMensagensForamLidas() {
    if(!this.ehElegivelParaAvisarQueAsMensagensForamLidas()) { return; }

    this.indicarQualMensagemPossuiraQuantitativoDeMensagensNovas();
    this.zerarQtdMensagensNovas();

    this.signalRService.marcarMensagemComoLida(0, this.conversaAtual.conversaId,
      this.conversaAtual.contatoAmigoId);
  }

  ehElegivelParaAvisarQueAsMensagensForamLidas() {
    return this.conversaAtual.qtdMensagensNovas > 0
      && this.conversaAtual.contatoDestinatarioId === this.contatoLogado.contatoId;
  }

  indicarQualMensagemPossuiraQuantitativoDeMensagensNovas() {
    const naoLidas = this.resultado.lista.filter(x => x.statusMensagem !== StatusMensagem.Lida);
    naoLidas[0].qtdMensagensNovas = this.conversaAtual.qtdMensagensNovas;
    naoLidas[0].qtdMensagensNovasDescricao = this.obterDescricaoQtdMensagensNovas();
  }

  obterDescricaoQtdMensagensNovas() {
    return this.conversaAtual.qtdMensagensNovas === 1
      ? StringResources.QTD_MSG_NOVA_SINGULAR
      : `${this.conversaAtual.qtdMensagensNovas} ${StringResources.QTD_MSG_NOVA_PLURAL}`;
  }

  zerarQtdMensagensNovas() {
    this.conversaAtual.qtdMensagensNovas = 0;
    this.conversaAtual.mostrarMensagensNovas = false;
  }

  desmarcarMensagemQuePossuiQuantitativoDeMensagensNovas() {
    const mensagem = this.obterMensagemQueEstaMarcadaComQtdDeMensagensNovas();
    if(!mensagem) { return; }

    mensagem.qtdMensagensNovas = 0;
    delete mensagem.qtdMensagensNovasDescricao;
  }

  obterMensagemQueEstaMarcadaComQtdDeMensagensNovas() {
    return this.resultado && this.resultado.lista
      && this.resultado.lista.find(x => x.qtdMensagensNovas > 0);
  }

  criarMapComMensagensOrdenadasPorData() {
    this.mensagensPorData = new Map<string, Mensagem[]>();
    const datas = this.obterDatasDasMensagens();

    datas.forEach(data => {
      const mensagens = this.obterMensagensPorData(data);
      const key = this.criarKeyParaMapMensagensPorData(new Date(data));

      this.mensagensPorData.set(key, mensagens);
    });
  }

  obterDatasDasMensagens() {
    return this.resultado.lista.map(x => new Date(x.dataEnvio).toDateString())
      .filter((item, i, ar) => ar.indexOf(item) === i)
      .sort((d1,d2) => new Date(d1).getTime() - new Date(d2).getTime());
  }

  obterMensagensPorData(data: string) {
    return this.resultado.lista.filter(x => new Date(x.dataEnvio).toDateString() === data)
      .sort((m1,m2) => new Date(m1.dataEnvio).getTime() - new Date(m2.dataEnvio).getTime());;
  }

  criarKeyParaMapMensagensPorData(data: Date) {
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

    return { dataDescricao, data: moment(data).format('L') };
  }

  scrollMensagens(target) {
    this.scrollHeightOld = target.scrollHeight;
    if (this.conversaAtual && !this.ultimaPagina
      && !this.buscandoMensagens && ((target.scrollTop - 100) <= 0)) {

      this.obterMensagensPaginado();
    }
  }

  obterMensagens() {
    this.buscandoMensagens = true;
    this.signalRService.obterMensagens(this.filtro);
  }

  obterMensagensPaginado() {
    this.filtro.pagina++;
    this.manterScrollTop = true;
    this.buscandoMensagens = true;
    this.signalRService.obterMensagens(this.filtro);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
