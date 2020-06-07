import { AutenticacaoRouting } from './autenticacao.routing';
import { ChatCommonModule } from './../_common/common.module';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CriarLoginComponent } from './criar-login/criar-login.component';

@NgModule({
  declarations: [
    LoginComponent,
    CriarLoginComponent
  ],
  imports: [
    ChatCommonModule,
    AutenticacaoRouting
  ],
  exports: [],
  providers: []
})
export class AutenticacaoModule { }
