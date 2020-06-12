import { Mensagem } from './../models/mensagem.model';
import { StringResources } from 'src/app/string-resources';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subscription, Subject, Observable } from 'rxjs';

@Injectable()
export class AppSignalRService implements OnDestroy {
  public connectionEstablished = new EventEmitter<boolean>();
  public receberMensagemSubject = new Subject<Mensagem>()
  public iniciarConexaoTimeoutDelay = 3000;
  public autoReconnect = true;

  private connectionId: string;
  private contatoId = 0;
  private conexaoEstaEstabelecida = false;
  private hubConnection: HubConnection;

  private connectedSubscription: Subscription;

  constructor() { }

  criarConexao(hubUrl: string, contatoId: number) {
    this.contatoId = contatoId;

    if (!this.hubConnection && this.contatoId > 0)
    {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(StringResources.URL_SERVIDOR + hubUrl)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.hubConnection.onclose((msg) => {
        this.iniciarConexao();
      });

      this.hubConnection.onreconnected((connectionId: string) => {
        this.hubConnection.invoke('RegistrarConexao', this.contatoId, this.connectionId)
        this.connectionId = connectionId;
      });
    }
  }

  iniciarConexao() {
    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      this.hubConnection
        .start()
        .then(() => {
          console.log('Conectado ao Hub');

          this.conexaoEstaEstabelecida = true;
          this.connectionEstablished.emit(true);

          this.hubConnection.invoke('RegistrarConexao', this.contatoId, this.connectionId);
          this.connectionId = this.hubConnection.connectionId;
        })
        .catch(err => {
          this.conexaoEstaEstabelecida = false;
          console.log('Erro ao tentar conectar, tentando novamente...');

            setTimeout(() => {
              this.iniciarConexao();
            }, this.iniciarConexaoTimeoutDelay);
        });
    }
  }

  run(method: string, ...args: any[]) {
    switch (this.hubConnection.state) {
      case HubConnectionState.Connected: ;
        this.hubConnection.invoke(method, ...args);
        break;
      case HubConnectionState.Connecting:
        this.connectedSubscription = this.connectionEstablished.subscribe((data: any) => {
          this.hubConnection.invoke(method, ...args);

          this.connectedSubscription.unsubscribe();
        });
        break;
      default:
        this.hubConnection.start()
          .then(() => {
            this.hubConnection.invoke(method, args)

            this.hubConnection.invoke('RegistrarConexao', this.contatoId, this.connectionId);
            this.connectionId = this.hubConnection.connectionId;
          })
          .catch(err => console.error(err.toString()));
        break;
    }
  }

  configurarMetodoReceberMensagem() {
    this.hubConnection.on('ReceberMensagem', (mensagem) => {
      this.enviarMensagem(mensagem);
    });
  }

  getConexaoEstaEstabelecida(): boolean {
    return this.conexaoEstaEstabelecida;
  }

  getHubConnection(): HubConnection {
    return this.hubConnection;
  }

  public receberMensagem(): Observable<Mensagem> {
    return this.receberMensagemSubject.asObservable();
  }

  public enviarMensagem(mensagem: Mensagem) {
    this.receberMensagemSubject.next(mensagem);
  }

  ngOnDestroy() {
    if (!this.connectedSubscription) { return; }
    this.connectedSubscription.unsubscribe();
  }
}
