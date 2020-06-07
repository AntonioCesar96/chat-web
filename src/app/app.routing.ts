import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const AppRouting = RouterModule.forRoot(
    [
      { path: '', component: HomeComponent },
      { path: '**', component: HomeComponent }
    ],
    { useHash: true }
  );
