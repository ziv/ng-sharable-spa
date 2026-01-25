import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {TopBar} from './components/top-bar';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopBar],
  host: {
    class: 'flex flex-col gap-2 h-full',
    '(window:keydown.control.s)': 'openSettings()',
  },
  template: `
    @defer {
      <!--
      we defer this part because it contain material components
      that we don't want them to be part of the initial bundle
      -->
      <td-top-bar/>
    }
    <section class="mx-8 flex-1">
      <router-outlet/>
    </section>
  `,
})
export class App {
  private readonly dialog = inject(MatDialog);

  async openSettings() {
    // lazy load the settings dialog component
    const {SettingsDialog} = await import('./components/settings-dialog');
    this.dialog.open(SettingsDialog);
  }
}
