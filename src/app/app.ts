import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialog} from './components/settings-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButton, RouterLink, MatIconButton, MatIcon],
  host: {
    class: 'flex flex-col gap-2 h-full',
    '(window:keydown.control.s)': 'openSettings()',
  },
  template: `
    <section class="mx-8 mt-4 flex gap-2 justify-between">
      <div class="flex gap-2">
        <button matButton="tonal" routerLink="/simple">Sample Data Table</button>
        <button matButton="tonal" routerLink="/github">Github Issues Table</button>
      </div>
      <div>
        <button matIconButton routerLink="/about" aria-label="About">
          <mat-icon>info</mat-icon>
        </button>
      </div>
    </section>
    <section class="mx-8">
      <router-outlet/>
    </section>
  `,
})
export class App {
  private readonly dialog = inject(MatDialog);

  openSettings() {
    console.log('OpenSettings');
    this.dialog.open(SettingsDialog);
  }
}
