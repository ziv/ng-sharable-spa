import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Field, form, required} from '@angular/forms/signals';
import {AppSettings} from '../app.settings';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';

@Component({
  selector: 'td-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field, MatSlideToggle, MatDialogContent, MatDialogTitle, MatFormField, MatLabel, MatInput, MatHint],
  template: `
    <h2 mat-dialog-title>Settings</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4">

        <section>
          <mat-slide-toggle [field]="frm.useCache"/>
          <span class="pl-2">Use cache</span>
        </section>

        @if (service.settings().useCache) {
          <mat-form-field>
            <mat-label>Cache duration</mat-label>
            <input type="number" matInput [field]="frm.cacheTTL">
            <mat-hint>Milliseconds</mat-hint>
          </mat-form-field>
        }

        <section>
          <mat-slide-toggle [field]="frm.simulateNetworkLatency"/>
          <span class="pl-2">Simulate network latency</span>
        </section>

        @if (service.settings().simulateNetworkLatency) {
          <mat-form-field>
            <mat-label>Network latency</mat-label>
            <input type="number" matInput [field]="frm.networkLatency">
            <mat-hint>Milliseconds</mat-hint>
          </mat-form-field>
        }

      </div>
    </mat-dialog-content>
  `,
})
export class SettingsDialog {
  protected readonly service = inject(AppSettings);

  /**
   * Settings form with validation
   * todo display validation errors in the UI
   * @protected
   */
  protected readonly frm = form(this.service.settings, (s) => {
    required(s.cacheTTL, {
      message: 'Cache TTL is required when cache is enabled',
      when: ({valueOf}) => valueOf(s.useCache),
    });
    required(s.networkLatency, {
      message: 'Network latency is required when simulation is enabled',
      when: ({valueOf}) => valueOf(s.simulateNetworkLatency),
    });
  });
}
