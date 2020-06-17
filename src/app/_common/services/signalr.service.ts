import { StringResources } from 'src/app/string-resources';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppSignalRService implements OnDestroy {
  private _connectionEstablished = new EventEmitter<boolean>();
  private _iniciarConexaoTimeoutDelay = 3000;
  private _contatoId = 0;
  private _hubConnection: HubConnection;
  private _connectedSubscription: Subscription;

  constructor() { }

  get hubConnection() {
    return this._hubConnection;
  }

  criarConexao(hubUrl: string, contatoId: number) {
    this._contatoId = contatoId;

    if (!this._hubConnection && this._contatoId > 0)
    {
      this._hubConnection = new HubConnectionBuilder()
        .withUrl(StringResources.URL_SERVIDOR + hubUrl)
        .configureLogging(LogLevel.Information)
        // .withAutomaticReconnect([0, 1000, 10000])
        .build();

      this._hubConnection.onclose((msg) => {
        this.iniciarConexao();
      });

      this._hubConnection.onreconnected((connectionId: string) => {
        this._hubConnection.invoke('RegistrarConexao', this._contatoId);
      });
    }
  }

  iniciarConexao() {
    if (this._hubConnection.state === HubConnectionState.Disconnected) {
      this._hubConnection
        .start()
        .then(() => {
          console.log('Conectado ao Hub');
          this._hubConnection.invoke('RegistrarConexao', this._contatoId);
          this._connectionEstablished.emit();
        })
        .catch(err => {
          console.log('Erro ao tentar conectar, tentando novamente...');
          setTimeout(() => {
            this.iniciarConexao();
          }, this._iniciarConexaoTimeoutDelay);
        });
    }
  }

  run(method: string, ...args: any[]) {
    switch (this._hubConnection.state) {
      case HubConnectionState.Connected: ;
        this._hubConnection.invoke(method, ...args);
        break;
      case HubConnectionState.Connecting:
        this._connectedSubscription = this._connectionEstablished.subscribe((data: any) => {
          this._hubConnection.invoke(method, ...args);
          this._connectedSubscription.unsubscribe();
        });
        break;
      default:
        this._hubConnection.start()
          .then(() => {
            this._hubConnection.invoke('RegistrarConexao', this._contatoId);
            this._hubConnection.invoke(method, args);
          })
          .catch(err => console.error(err.toString()));
        break;
    }
  }

  ngOnDestroy() {
    if (!this._connectedSubscription) { return; }
    this._connectedSubscription.unsubscribe();
  }
}
