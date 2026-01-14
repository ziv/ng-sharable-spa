import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialog} from './components/settings-dialog';
import {TopBar} from './components/top-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar],
  host: {
    class: 'flex flex-col gap-2 h-full',
    '(window:keydown.control.s)': 'openSettings()',
  },
  template: `
    @defer {
      <!--
      we defer this part because it contain material components
      that we don't want to be part of the initial bundle
      -->
      <td-top-bar/>
    }
    <section class="mx-8">
      <router-outlet/>
    </section>
  `,
})
export class App {
  private readonly dialog = inject(MatDialog);

  openSettings() {
    this.dialog.open(SettingsDialog);
  }
}
