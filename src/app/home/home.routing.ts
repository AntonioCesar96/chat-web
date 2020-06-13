import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';

export const HomeRouting = RouterModule.forRoot(
    [
      { path: 'home', component: HomeComponent },
    ],
    { useHash: true }
  );
