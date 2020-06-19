import { ConversaFiltro } from '../models/conversa.filtro';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { ContatoStatus } from '../models/contato-status.model';
import { Mensagem } from '../models/mensagem.model';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Resultado } from '../models/resultado.model';
import { UltimaConversa } from '../models/ultima-conversa.model';
import { AppSignalRService } from './app-signalr.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private _receberMensagemSubject = new Subject<Mensagem>();
  private _receberPrimeiraMensagemSubject = new Subject<Mensagem>();
  private _contatoDigitandoSubject = new Subject<any>();
  private _statusDoContatoSubject = new Subject<ContatoStatus>();
  private _mensagemLidaSubject = new Subject<Mensagem>();
  private _deslogarSubject = new Subject<any>();
  private _conversasDoContatoSubject = new Subject<Resultado<UltimaConversa>>();
  private _conversasDoContatoPesquisaSubject = new Subject<Resultado<UltimaConversa>>();
  private _mensagensSubject = new Subject<Resultado<Mensagem>>();
  private _contatosAmigosPesquisaSubject = new Subject<Resultado<any>>();

  constructor(private appSignalRService: AppSignalRService) { }

  inicializar(contatoId: number) {
    this.appSignalRService.criarConexao('/chatHub', contatoId);
    this.appSignalRService.iniciarConexao();
    this.configurarMetodos();
  }

  configurarMetodos() {
    const hubConnection = this.appSignalRService.hubConnection;
    hubConnection.on('ReceberMensagem', (mensagem) => {
      this._receberMensagemSubject.next(mensagem);
    });

    hubConnection.on('ReceberPrimeiraMensagem', (mensagem) => {
      this._receberPrimeiraMensagemSubject.next(mensagem);
    });

    hubConnection.on('ReceberContatoDigitando', (estaDigitando, contatoQueEstaDigitandoId) => {
      this._contatoDigitandoSubject.next({ estaDigitando, contatoQueEstaDigitandoId });
    });

    hubConnection.on('ReceberStatusDoContato', (contatoStatus: ContatoStatus) => {
      this._statusDoContatoSubject.next(contatoStatus);
    });

    hubConnection.on('Deslogar', () => {
      this._deslogarSubject.next();
    });

    hubConnection.on('ReceberMensagemLida', (mensagemId: number, conversaId: number) => {
      const mensagem = new Mensagem();
      mensagem.mensagemId = mensagemId;
      mensagem.conversaId = conversaId;
      this._mensagemLidaSubject.next(mensagem);
    });

    hubConnection.on('ReceberConversasDoContato', (res: Resultado<UltimaConversa>) => {
      this._conversasDoContatoSubject.next(res);
    });

    hubConnection.on('ReceberConversasDoContatoPesquisa', (res: Resultado<UltimaConversa>) => {
      this._conversasDoContatoPesquisaSubject.next(res);
    });

    hubConnection.on('ReceberMensagens', (res: Resultado<Mensagem>) => {
      this._mensagensSubject.next(res);
    });

    hubConnection.on('ReceberContatosAmigosPesquisa', (res: Resultado<any>) => {
      this._contatosAmigosPesquisaSubject.next(res);
    });
  }

  receberMensagem(): Observable<Mensagem> {
    return this._receberMensagemSubject.asObservable();
  }

  receberPrimeiraMensagem(): Observable<Mensagem> {
    return this._receberPrimeiraMensagemSubject.asObservable();
  }

  receberContatoDigitando(): Observable<any> {
    return this._contatoDigitandoSubject.asObservable();
  }

  receberStatusDoContato(): Observable<ContatoStatus> {
    return this._statusDoContatoSubject.asObservable();
  }

  receberDeslogar(): Observable<any> {
    return this._deslogarSubject.asObservable();
  }

  receberMensagemLida(): Observable<Mensagem> {
    return this._mensagemLidaSubject.asObservable();
  }

  receberConversasDoContato(): Observable<Resultado<UltimaConversa>> {
    return this._conversasDoContatoSubject.asObservable();
  }

  receberConversasDoContatoPesquisa(): Observable<Resultado<UltimaConversa>> {
    return this._conversasDoContatoPesquisaSubject.asObservable();
  }

  receberMensagens(): Observable<Resultado<Mensagem>> {
    return this._mensagensSubject.asObservable();
  }

  receberContatosAmigosPesquisa(): Observable<Resultado<any>> {
    return this._contatosAmigosPesquisaSubject.asObservable();
  }

  marcarMensagemComoLida(mensagemId: number, conversaId: number, contatoRemetenteId: number) {
    this.appSignalRService.run('MarcarMensagemComoLida', mensagemId, conversaId, contatoRemetenteId);
  }

  enviarContatoDigitando(estaDigitando: boolean, contatoAmigoId: number, contatoLogadoId: number) {
    this.appSignalRService.run('EnviarContatoDigitando', estaDigitando, contatoAmigoId, contatoLogadoId);
  }

  enviarMensagem(mensagem: Mensagem) {
    this.appSignalRService.run('EnviarMensagem', mensagem);
  }

  obterMensagens(filtro: MensagemFiltro) {
    this.appSignalRService.run('ObterMensagens', filtro);
  }

  obterConversasDoContato(filtro: ConversaFiltro) {
    this.appSignalRService.run('ObterConversasDoContato', filtro);
  }

  obterConversasDoContatoPesquisa(filtro: ConversaFiltro) {
    this.appSignalRService.run('ObterConversasDoContatoPesquisa', filtro);
  }

  obterContatosAmigosPesquisa(filtro: any) {
    this.appSignalRService.run('ObterContatosAmigosPesquisa', filtro);
  }

  obterStatusDoContato(contatoId: number) {
    this.appSignalRService.run('ObterStatusDoContato', contatoId);
  }
}
