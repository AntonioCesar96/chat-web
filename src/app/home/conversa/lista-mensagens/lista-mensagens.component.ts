import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output } from '@angular/core';
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
export class ListaMensagensComponent implements OnInit, OnDestroy {
  @Input() contato: Contato;

  filtro: MensagemFiltro;
  mensagensPorData: Map<string, Mensagem[]>;
  resultado: Resultado<Mensagem>;
  ultimaConversa: UltimaConversa;
  conversaSubscription: Subscription;
  receberMensagemSubscription: Subscription;

  constructor(
    private mensagemService: MensagemService,
    private conversaHandleService: ConversaHandleService,
    private appSignalRService: AppSignalRService) { }

  ngOnInit() {
    this.inicializar();
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
        this.criarListaInicial();
        this.obterMensagens(conversa.conversaId);
    });

    this.receberMensagemSubscription = this.appSignalRService
    .receberMensagem()
    .subscribe((mensagem) => {
      this.receberMensagem(mensagem);
    });
  }

  existeConversas() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  ehIgualAoContatoLogado(item: Mensagem) {
    return item.contatoRemetenteId === this.contato.contatoId;
  }

  criarListaInicial() {
    const mensagem = new Mensagem();
    mensagem.conversaId = this.ultimaConversa.conversaId;
    mensagem.contatoRemetenteId =  this.ultimaConversa.contatoRemetenteId;
    mensagem.dataEnvio =  this.ultimaConversa.dataEnvio;
    mensagem.mensagemEnviada =  this.ultimaConversa.ultimaMensagem;

    this.resultado = new Resultado<Mensagem>();
    this.resultado.lista = [ mensagem ];

    this.ordenarMensagens();
  }

  obterMensagens(conversaId: number) {
    this.filtro = new MensagemFiltro(conversaId);
    this.mensagemService.obterMensagens(this.filtro)
      .subscribe(res => {
        this.resultado = res as Resultado<Mensagem>;
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

  receberMensagem(mensagem: Mensagem) {
    if(!this.ultimaConversa ||
        this.ultimaConversa.conversaId !== mensagem.conversaId) {
      return;
    }

    this.resultado.lista.push(mensagem);
    this.resultado.total++;
    this.ordenarMensagens()
  }
}
