import { HomeModule } from './home/home.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { ChatCommonModule } from './_common/common.module';
import { AppRouting } from './app.routing';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ChatCommonModule,
    AutenticacaoModule,
    HomeModule,
    AppRouting
  ],
  exports: [
    ChatCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
