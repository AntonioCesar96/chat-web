import { ConversaService } from './services/conversa.service';
import { HomeRouting } from './home.routing';
import { ChatCommonModule } from './../_common/common.module';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { ListaConversasComponent } from './lista-conversas/lista-conversas.component';
import { ConversaComponent } from './conversa/conversa.component';
import { EnviarMensagemComponent } from './conversa/enviar-mensagem/enviar-mensagem.component';
import { ListaMensagensComponent } from './conversa/lista-mensagens/lista-mensagens.component';
import { ContatoMensagemComponent } from './conversa/contato-mensagem/contato-mensagem.component';

@NgModule({
  declarations: [
    HomeComponent,
    ListaConversasComponent,
    ConversaComponent,
    EnviarMensagemComponent,
    ListaMensagensComponent,
    ContatoMensagemComponent
  ],
  imports: [
    ChatCommonModule,
    HomeRouting
  ],
  exports: [],
  providers: [
    ConversaService
  ]
})
export class HomeModule { }
