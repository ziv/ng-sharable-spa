import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () => import('./features/simple-table/simple-table')
  },
  {
    path: 'github',
    loadComponent: () => import('./features/github/github-issues-table')
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  }
];
