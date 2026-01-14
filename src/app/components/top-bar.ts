import {Component} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'td-top-bar',
  imports: [
    MatButton,
    MatIcon,
    MatIconButton,
    RouterLink
  ],
  host: {
    class: 'mx-8 mt-4 flex gap-2 justify-between',
  },
  template: `
    <div class="flex gap-2">
      <button matButton="tonal" routerLink="/simple">Sample Data Table</button>
      <button matButton="tonal" routerLink="/github">Github Issues Table</button>
    </div>
    <div>
      <button matIconButton routerLink="/about" aria-label="About">
        <mat-icon>info</mat-icon>
      </button>
    </div>
  `,
})
export class TopBar {
}
