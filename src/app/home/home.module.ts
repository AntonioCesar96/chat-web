import { PesquisaContatosComponent } from './conversas/pesquisa/pesquisa-contatos/pesquisa-contatos.component';
import { ConversaSubjectsService } from './services/conversa-subjects.service';
import { HomeRouting } from './home.routing';
import { ChatCommonModule } from './../_common/common.module';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { ConversasComponent } from './conversas/conversas.component';
import { ConversaComponent } from './conversa/conversa.component';
import { EnviarMensagemComponent } from './conversa/enviar-mensagem/enviar-mensagem.component';
import { ListaMensagensComponent } from './conversa/lista-mensagens/lista-mensagens.component';
import { ContatoMensagemComponent } from './conversa/contato-mensagem/contato-mensagem.component';
import { ListaConversasComponent } from './conversas/lista-conversas/lista-conversas.component';
import { PesquisaComponent } from './conversas/pesquisa/pesquisa.component';
import { PesquisaConversasComponent } from './conversas/pesquisa/pesquisa-conversas/pesquisa-conversas.component';

@NgModule({
  declarations: [
    HomeComponent,
    ConversasComponent,
    ConversaComponent,
    EnviarMensagemComponent,
    ListaMensagensComponent,
    ContatoMensagemComponent,
    ListaConversasComponent,
    PesquisaComponent,
    PesquisaConversasComponent,
    PesquisaContatosComponent
  ],
  imports: [
    ChatCommonModule,
    HomeRouting
  ],
  exports: [],
  providers: [
    ConversaSubjectsService
  ]
})
export class HomeModule { }
