import { ConversaFiltro } from './../models/conversa.filtro';
import { MensagemFiltro } from 'src/app/_common/models/mensagem.filtro';
import { ContatoStatus } from '../models/contato-status.model';
import { Mensagem } from '../models/mensagem.model';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Resultado } from '../models/resultado.model';
import { UltimaConversa } from '../models/ultima-conversa.model';
import { AppSignalRService } from './signalr.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private _receberMensagemSubject = new Subject<Mensagem>();
  private _contatoDigitandoSubject = new Subject<any>();
  private _statusContatoOnlineSubject = new Subject<number>();
  private _statusContatoOfflineSubject = new Subject<ContatoStatus>();
  private _mensagemLidaSubject = new Subject<Mensagem>();
  private _deslogarSubject = new Subject<any>();
  private _conversasDoContatoSubject = new Subject<Resultado<UltimaConversa>>();
  private _mensagensSubject = new Subject<Resultado<Mensagem>>();

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

    hubConnection.on('ReceberContatoDigitando', (estaDigitando, contatoQueEstaDigitandoId) => {
      this._contatoDigitandoSubject.next({ estaDigitando, contatoQueEstaDigitandoId });
    });

    hubConnection.on('ReceberStatusContatoOnline', (contatoId: number) => {
      this._statusContatoOnlineSubject.next(contatoId);
    });

    hubConnection.on('ReceberStatusContatoOffline', (contatoStatus: ContatoStatus) => {
      this._statusContatoOfflineSubject.next(contatoStatus);
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

    hubConnection.on('ReceberMensagens', (res: Resultado<Mensagem>) => {
      this._mensagensSubject.next(res);
    });
  }

  receberMensagem(): Observable<Mensagem> {
    return this._receberMensagemSubject.asObservable();
  }

  receberContatoDigitando(): Observable<any> {
    return this._contatoDigitandoSubject.asObservable();
  }

  receberStatusContatoOffline(): Observable<ContatoStatus> {
    return this._statusContatoOfflineSubject.asObservable();
  }

  receberStatusContatoOnline(): Observable<number> {
    return this._statusContatoOnlineSubject.asObservable();
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

  receberMensagens(): Observable<Resultado<Mensagem>> {
    return this._mensagensSubject.asObservable();
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
}
