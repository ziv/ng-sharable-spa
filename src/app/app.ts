import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButton, RouterLink],
  host: {
    class: 'flex flex-col gap-2 h-full'
  },
  template: `
    <section class="mx-8 mt-4 flex gap-2">
      <button matButton="tonal" routerLink="/main">Sample Data Table</button>
      <button matButton="tonal" routerLink="/github">Github Issues Table</button>
    </section>
    <section class="mx-8">
      <router-outlet/>
    </section>
  `,
})
export class App {
}
