import { UrlService } from './_common/services/url.service';
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
  providers: [UrlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
