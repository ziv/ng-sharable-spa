import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'simple',
    loadComponent: () => import('./features/simple-table/simple-table')
  },
  {
    path: 'github',
    loadComponent: () => import('./features/github/github-issues-table')
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about')
  },
  {
    path: '',
    redirectTo: 'simple',
    pathMatch: 'full'
  }
];
