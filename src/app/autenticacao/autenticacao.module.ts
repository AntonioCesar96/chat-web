import { AutenticacaoService } from './services/autenticacao.service';
import { LoginService } from './services/login.service';
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
  providers: [ LoginService ]
})
export class AutenticacaoModule { }
