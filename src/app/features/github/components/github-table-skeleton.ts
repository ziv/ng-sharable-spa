import {Component, inject, input} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {DatePipe} from '@angular/common';
import {type GithubIssueLabel, GithubLabels} from './github-labels';
import {Router} from '@angular/router';


@Component({
  selector: 'app-github-table-skeleton',
  imports: [
    MatTableModule,
  ],
  template: `
    <table mat-table [dataSource]="items">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let e"><div class="skeleton">&nbsp;</div></td>
      </ng-container>

      <ng-container matColumnDef="created_at">
        <th mat-header-cell *matHeaderCellDef>Created</th>
        <td mat-cell *matCellDef="let e" class="text-nowrap"><div class="skeleton">&nbsp;</div></td>
      </ng-container>

      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let e"><div class="skeleton">&nbsp;</div></td>
      </ng-container>

      <ng-container matColumnDef="labels">
        <th mat-header-cell *matHeaderCellDef>Labels</th>
        <td mat-cell *matCellDef="let e"><div class="skeleton">&nbsp;</div></td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
  styles: ``,
})

export class GithubTableSkeleton {
  // private readonly router = inject(Router);
  protected readonly cols = ['id', 'created_at', 'title', 'labels'];
  protected readonly items = Array.from({length: 10}, () => ({}));
}

