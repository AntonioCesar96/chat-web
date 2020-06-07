import { CriarLoginComponent } from './criar-login/criar-login.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';

export const AutenticacaoRouting = RouterModule.forRoot(
    [
      { path: 'entrar', component: LoginComponent },
      { path: 'criar-conta', component: CriarLoginComponent }
    ],
    { useHash: true }
  );
