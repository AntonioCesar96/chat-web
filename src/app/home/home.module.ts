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
  providers: []
})
export class HomeModule { }
