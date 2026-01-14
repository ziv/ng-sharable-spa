import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatTableModule} from '@angular/material/table';

/**
 * Descriptor for skeleton table
 */
export type SkeletonTableDesc = {
  cols: { title: string; width: string; }[];
  rows: number;
}

@Component({
  selector: 'app-table-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // todo add the correct styles and get rid of the TableModule import
  imports: [MatTableModule],
  template: `
    <table mat-table [dataSource]="items()">
      @for (col of desc().cols; track col.title) {
        <ng-container [matColumnDef]="col.title">
          <th mat-header-cell *matHeaderCellDef>{{ col.title }}</th>
          <td mat-cell *matCellDef [class]="col.width">
            <div class="skeleton">&nbsp;</div>
          </td>
        </ng-container>
      }
      <tr mat-header-row *matHeaderRowDef="cols()"></tr>
      <tr mat-row *matRowDef="let row; columns: cols()"></tr>
    </table>
  `,
})
export class TableSkeleton {
  readonly desc = input.required<SkeletonTableDesc>();

  protected readonly cols = computed(() => this.desc().cols.map(c => c.title));
  protected readonly items = computed(() => new Array(this.desc().rows).fill({}));
}
