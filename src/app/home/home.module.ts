import { ConversaHandleService } from './services/conversa-handle.service';
import { MensagemService } from './services/mensagem.service';
import { ConversaService } from './services/conversa.service';
import { HomeRouting } from './home.routing';
import { ChatCommonModule } from './../_common/common.module';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { ListaConversasComponent } from './lista-conversas/lista-conversas.component';
import { ConversaComponent } from './conversa/conversa.component';

@NgModule({
  declarations: [
    HomeComponent,
    ListaConversasComponent,
    ConversaComponent
  ],
  imports: [
    ChatCommonModule,
    HomeRouting
  ],
  exports: [],
  providers: [
    ConversaService,
    MensagemService,
    ConversaHandleService
  ]
})
export class HomeModule { }
