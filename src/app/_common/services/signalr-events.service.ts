import { ContatoStatus } from '../models/contato-status.model';
import { Mensagem } from '../models/mensagem.model';
import { Injectable } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { Resultado } from '../models/resultado.model';
import { UltimaConversa } from '../models/ultima-conversa.model';

@Injectable({ providedIn: 'root' })
export class SignalREventsService {
  private _receberMensagemSubject = new Subject<Mensagem>();
  private _contatoDigitandoSubject = new Subject<any>();
  private _statusContatoOnlineSubject = new Subject<number>();
  private _statusContatoOfflineSubject = new Subject<ContatoStatus>();
  private _mensagemLidaSubject = new Subject<Mensagem>();
  private _deslogarSubject = new Subject<any>();
  private _conversasDoContatoSubject = new Subject<Resultado<UltimaConversa>>();
  private _mensagensSubject = new Subject<Resultado<Mensagem>>();

  constructor() { }

  configurarMetodos(hubConnection: HubConnection) {
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

  public receberMensagem(): Observable<Mensagem> {
    return this._receberMensagemSubject.asObservable();
  }

  public receberContatoDigitando(): Observable<any> {
    return this._contatoDigitandoSubject.asObservable();
  }

  public receberStatusContatoOffline(): Observable<ContatoStatus> {
    return this._statusContatoOfflineSubject.asObservable();
  }

  public receberStatusContatoOnline(): Observable<number> {
    return this._statusContatoOnlineSubject.asObservable();
  }

  public receberDeslogar(): Observable<any> {
    return this._deslogarSubject.asObservable();
  }

  public receberMensagemLida(): Observable<Mensagem> {
    return this._mensagemLidaSubject.asObservable();
  }

  public receberConversasDoContato(): Observable<Resultado<UltimaConversa>> {
    return this._conversasDoContatoSubject.asObservable();
  }

  public receberMensagens(): Observable<Resultado<Mensagem>> {
    return this._mensagensSubject.asObservable();
  }
}
