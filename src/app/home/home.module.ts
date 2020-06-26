import { SignalRService } from './services/signalr.service';
import { ConversaService } from './services/conversa.service';
import { AppSignalRService } from './services/app-signalr.service';
import { PesquisaContatosComponent } from './pesquisa/pesquisa-contatos/pesquisa-contatos.component';
import { ConversaSubjectsService } from './services/conversa-subjects.service';
import { HomeRouting } from './home.routing';
import { ChatCommonModule } from './../_common/common.module';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { ConversasComponent } from './conversas/conversas.component';
import { MensagensComponent } from './mensagens/mensagens.component';
import { EnviarMensagemComponent } from './mensagens/enviar-mensagem/enviar-mensagem.component';
import { ListaMensagensComponent } from './mensagens/lista-mensagens/lista-mensagens.component';
import { ContatoMensagemComponent } from './mensagens/contato-mensagem/contato-mensagem.component';
import { ListaConversasComponent } from './conversas/lista-conversas/lista-conversas.component';
import { PesquisaComponent } from './pesquisa/pesquisa.component';
import { PesquisaConversasComponent } from './pesquisa/pesquisa-conversas/pesquisa-conversas.component';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { OpcoesComponent } from './opcoes/opcoes.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ContatosComponent } from './contatos/contatos.component';

@NgModule({
  declarations: [
    HomeComponent,
    ConversasComponent,
    MensagensComponent,
    EnviarMensagemComponent,
    ListaMensagensComponent,
    ContatoMensagemComponent,
    ListaConversasComponent,
    PesquisaComponent,
    PesquisaConversasComponent,
    PesquisaContatosComponent,
    DetalhesComponent,
    OpcoesComponent,
    PerfilComponent,
    ContatosComponent
  ],
  imports: [
    ChatCommonModule,
    HomeRouting
  ],
  exports: [],
  providers: [
    AppSignalRService,
    ConversaSubjectsService,
    ConversaService,
    SignalRService
  ]
})
export class HomeModule { }
