import { RouterModule } from '@angular/router';
import { LoginComponent } from './autenticacao/login/login.component';

export const AppRouting = RouterModule.forRoot(
    [
      { path: '', component: LoginComponent },
      { path: '**', component: LoginComponent }
    ],
    { useHash: true }
  );
