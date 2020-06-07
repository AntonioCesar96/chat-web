import { RouterModule } from '@angular/router';

export const HomeRouting = RouterModule.forRoot(
    [
      { path: 'home', redirectTo: '', pathMatch: 'full' }
    ],
    { useHash: true }
  );
