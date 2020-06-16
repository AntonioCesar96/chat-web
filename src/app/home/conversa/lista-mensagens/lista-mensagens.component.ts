import { SignalREventsService } from './../../../_common/services/signalr-events.service';
import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaService } from '../../services/conversa.service';
import { AppSignalRService } from 'src/app/_common/services/signalr.service';
import * as moment from 'moment';
import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';

@Component({
  selector: 'app-lista-mensagens',
  templateUrl: './lista-mensagens.component.html'
})
export class ListaMensagensComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() contatoLogado: Contato;
  @ViewChild('mensagem') mensagem: ElementRef;
  @ViewChildren('mensagemNova') mensagemNova: QueryList<any>;
  @ViewChildren('mensagemPorData') viewsMensagemData: QueryList<any>;

  filtro: MensagemFiltro;
  mensagensPorData: Map<any, Mensagem[]>;
  resultado: Resultado<Mensagem>;
  ultimaConversa: UltimaConversa;
  conversaSubscription: Subscription;
  receberMensagemSubscription: Subscription;
  receberMensagemLidaSubscription: Subscription;
  mensagensSubscription: Subscription;
  manterScrollTop = false;
  buscandoMensagens = false;
  ultimaPagina = false;
  scrollHeightOld = 0;

  constructor(
    private conversaService: ConversaService,
    private appSignalRService: AppSignalRService,
    private signalREventsService: SignalREventsService) { }

  ngOnInit() {
    this.inicializar();
  }

  ngAfterViewInit() {
    this.viewsMensagemData.changes.subscribe(t => {
      this.viewsMensagemRenderizadas();
    });

    this.mensagemNova.changes.subscribe(t => {
      // TODO:
      if(!this.manterScrollTop && this.obterMensagemNova() && this.mensagemNova.first) {
        const elemento = this.mensagemNova.first;
        this.mensagem.nativeElement.scrollTop = elemento.nativeElement.offsetTop - 130; // TODO:
      }
    });
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

  inicializar() {
    this.conversaSubscription = this.conversaService
      .conversaSelecionada()
      .subscribe((conversa) => {
        this.ultimaConversa = conversa;
        this.inicializarVariaveis()
        this.criarListaInicial();
        this.criarFiltro(conversa.conversaId);
        this.obterMensagens();
    });

    this.receberMensagemSubscription = this.signalREventsService
      .receberMensagem()
      .subscribe((mensagem) => {
        this.receberMensagem(mensagem);
    });

    this.receberMensagemLidaSubscription = this.signalREventsService
      .receberMensagemLida()
      .subscribe((mensagem: Mensagem) => {
        this.marcarMensagemComoLida(mensagem);
    });

    this.mensagensSubscription = this.signalREventsService
      .receberMensagens()
      .subscribe((res: Resultado<Mensagem>) => {
        if(this.manterScrollTop) {
          this.resultado.total = res.total;
          this.resultado.lista.push(...res.lista);
          this.ordenarMensagens();
          this.buscandoMensagens = false;
          this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
          return;
        }

        this.resultado = res;
        this.buscandoMensagens = false;
        this.filtro.primeiraBusca = false;
        this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
        this.marcarMensagemNova();
        this.ordenarMensagens();
    });
  }

  inicializarVariaveis() {
    this.manterScrollTop = false;
    this.buscandoMensagens = false;
    this.ultimaPagina = false;
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
      this.appSignalRService.run('MarcarMensagemComoLida',
        mensagem.mensagemId, mensagem.conversaId, mensagem.contatoRemetenteId);
    }
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
    this.appSignalRService.run('ObterMensagens', this.filtro);
  }

  marcarMensagemNova() {
    this.ultimaConversa.conversaAberta = true;
    if(this.ultimaConversa.qtdMensagensNovas === 0) { return; }

    const naoLidas = this.resultado.lista.filter(x => x.statusMensagem !== StatusMensagem.Lida);
    naoLidas[0].qtdMensagensNovas = this.ultimaConversa.qtdMensagensNovas;

    this.ultimaConversa.qtdMensagensNovas = 0;
    this.ultimaConversa.mostrarMensagensNovas = false;

    this.appSignalRService.run('MarcarMensagemComoLida',
      0, this.ultimaConversa.conversaId, this.ultimaConversa.contatoAmigoId);
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
    const lista = this.resultado.lista;
    const datas = lista.map(x => new Date(x.dataEnvio).toDateString())
    .filter((item, i, ar) => ar.indexOf(item) === i)
    .sort((d1,d2) => new Date(d1).getTime() - new Date(d2).getTime());

    this.mensagensPorData = new Map<string, Mensagem[]>();
    datas.forEach(data => {
      const mensagens = lista.filter(x => new Date(x.dataEnvio).toDateString() === data)
        .sort((m1,m2) => new Date(m1.dataEnvio).getTime() - new Date(m2.dataEnvio).getTime());

      const dataKey = this.obterDataKey(new Date(data));
      this.mensagensPorData.set(dataKey, mensagens);
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

    return { dataDescricao, data: moment(data).format('L') };
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
    this.appSignalRService.run('ObterMensagens', this.filtro);
  }

  ngOnDestroy() {
    if (!this.conversaSubscription) { return; }
    this.conversaSubscription.unsubscribe();

    if (!this.receberMensagemSubscription) { return; }
    this.receberMensagemSubscription.unsubscribe();

    if (!this.receberMensagemLidaSubscription) { return; }
    this.receberMensagemLidaSubscription.unsubscribe();

    if (!this.mensagensSubscription) { return; }
    this.mensagensSubscription.unsubscribe();
  }
}
