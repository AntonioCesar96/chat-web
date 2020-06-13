import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { MensagemService } from '../../services/mensagem.service';
import { ConversaHandleService } from '../../services/conversa-handle.service';
import { AppSignalRService } from 'src/app/_common/services/signalr-service.service';

@Component({
  selector: 'app-lista-mensagens',
  templateUrl: './lista-mensagens.component.html'
})
export class ListaMensagensComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() contato: Contato;
  @ViewChild('mensagem') mensagem: ElementRef;
  @ViewChildren('mensagemPorData') viewsMensagemData: QueryList<any>;

  filtro: MensagemFiltro;
  mensagensPorData: Map<string, Mensagem[]>;
  resultado: Resultado<Mensagem>;
  ultimaConversa: UltimaConversa;
  conversaSubscription: Subscription;
  receberMensagemSubscription: Subscription;
  manterScroll = false;
  buscandoMensagens = false;
  ultimaPagina = false;
  scrollHeightOld = 0;

  constructor(
    private mensagemService: MensagemService,
    private conversaHandleService: ConversaHandleService,
    private appSignalRService: AppSignalRService) { }

  ngOnInit() {
    this.inicializar();
  }

  ngAfterViewInit() {
    this.viewsMensagemData.changes.subscribe(t => {
      this.viewsMensagemRenderizadas();
    })
  }

  viewsMensagemRenderizadas() {
    const elemento = this.mensagem.nativeElement;
    if(this.manterScroll) {
      elemento.scrollTop = elemento.scrollTop + (elemento.scrollHeight - this.scrollHeightOld);
      return;
    }

    elemento.scrollTop = elemento.scrollHeight - elemento.offsetHeight;
  }

  ngOnDestroy() {
    if (!this.conversaSubscription) { return; }
    this.conversaSubscription.unsubscribe();

    if (!this.receberMensagemSubscription) { return; }
    this.receberMensagemSubscription.unsubscribe();
  }

  inicializar() {
    this.conversaSubscription = this.conversaHandleService
      .conversaSelecionada()
      .subscribe((conversa) => {
        this.ultimaConversa = conversa;
        this.inicializarVariaveis()
        this.criarListaInicial();
        this.criarFiltro(conversa.conversaId);
        this.obterMensagens();
    });

    this.receberMensagemSubscription = this.appSignalRService
      .receberMensagem()
      .subscribe((mensagem) => {
        this.receberMensagem(mensagem);
    });
  }

  inicializarVariaveis() {
    this.manterScroll = false;
    this.buscandoMensagens = false;
    this.ultimaPagina = false;
  }

  receberMensagem(mensagem: Mensagem) {
    if(!this.ultimaConversa ||
        this.ultimaConversa.conversaId !== mensagem.conversaId) {
      return;
    }

    this.resultado.lista.push(mensagem);
    this.resultado.total++;
    this.manterScroll = false;
    this.filtro.qtdMensagensPular++;
    this.ordenarMensagens()
  }

  ehIgualAoContatoLogado(item: Mensagem) {
    return item.contatoRemetenteId === this.contato.contatoId;
  }

  criarListaInicial() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId =  this.ultimaConversa.contatoRemetenteId;
    mensagem.contatoDestinatarioId =  this.ultimaConversa.contatoDestinatarioId;
    mensagem.dataEnvio =  this.ultimaConversa.dataEnvio;
    mensagem.mensagemEnviada =  this.ultimaConversa.ultimaMensagem;

    this.resultado = new Resultado<Mensagem>();
    this.resultado.lista = [ mensagem ];

    this.ordenarMensagens();
  }

  criarFiltro(conversaId: number) {
    this.filtro = new MensagemFiltro(conversaId);
  }

  obterMensagens() {
    this.buscandoMensagens = true;
    this.mensagemService.obterMensagens(this.filtro)
      .subscribe(res => {
        this.resultado = res as Resultado<Mensagem>;
        this.buscandoMensagens = false;
        this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
        this.ordenarMensagens();
      });
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

        this.mensagensPorData.set(new Date(data).toLocaleDateString(), mensagens);
    });
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
    this.manterScroll = true;
    this.buscandoMensagens = true;
    this.mensagemService.obterMensagens(this.filtro)
      .subscribe(res => {
        const resultado = res as Resultado<Mensagem>;

        this.resultado.total = resultado.total;
        this.resultado.lista.push(...resultado.lista);
        this.ordenarMensagens();
        this.buscandoMensagens = false;
        this.ultimaPagina = this.resultado.lista.length === this.resultado.total;
      });
  }
}
