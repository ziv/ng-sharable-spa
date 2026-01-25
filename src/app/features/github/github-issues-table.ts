import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {httpResource} from '@angular/common/http';
import {DatePipe, JsonPipe} from '@angular/common';
import {GithubFilters} from './components/github-filters';
import {type GithubIssueLabel, GithubLabels} from './components/github-labels';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {SkeletonTableDesc, TableSkeleton} from '../../components/table-skeleton';

export type GithubIssuesItem = {
  url: string;
  repository_url: string;
  id: string;
  title: string;
  created_at: string;
  labels: GithubIssueLabel[];
};

export type GithubIssuesResponse = {
  total_count: number;
  items: GithubIssuesItem[];
}

export type QueryParams = {
  org: string;
  repo: string;
  page: string;
}

@Component({
  selector: 'app-main-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatSortModule,
    JsonPipe,
    GithubFilters,
    DatePipe,
    GithubLabels,
    MatPaginator,
    TableSkeleton,
  ],
  styles: `
    th {
      position: sticky;
      top: 0;
      background-color: #fff;
      z-index: 1;
    }
  `,
  template: `
    <div class="shadow-lg rounded-lg overflow-y-auto">
      <app-github-filters/>

      @if (issues.error()) {
        <!-- Error State -->
        <p class="text-red-600">An error occurred:</p>
        <div>
          <!-- todo improve error display -->
          <pre>{{ issues.error() | json }}</pre>
        </div>


      } @else if (issues.isLoading()) {
        <!-- Loading State -->
        <div style="max-height:calc(100vh - 15rem);overflow-y: auto">
          <app-table-skeleton [desc]="skeleton"/>
        </div>


      } @else if (items().length === 0) {
        <!-- Empty State -->
        <p class="p-4">No issues found...</p>

      } @else {
        <div style="max-height:calc(100vh - 15rem);overflow-y: auto">
          <table mat-table [dataSource]="items()">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let e" class="w-1/8">{{ e['id'] }}</td>
            </ng-container>

            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let e" class="text-nowrap w-1/8">{{ e['created_at'] | date }}</td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let e" class="w-3/8">{{ e['title'] }}</td>
            </ng-container>

            <ng-container matColumnDef="labels">
              <th mat-header-cell *matHeaderCellDef>Labels</th>
              <td mat-cell *matCellDef="let e" class="w-3/8">
                <app-github-labels [labels]="e['labels']"/>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols" style="position: sticky"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;let i = index" [style.--i]="i"></tr>
          </table>
        </div>
      }
      <mat-paginator [pageSizeOptions]="[30]"
                     [hidePageSize]="true"
                     [length]="total()"
                     [pageIndex]="params()?.['page'] || 0"
                     [pageSize]="30"
                     (page)="pageChange($event)"
                     showFirstLastButtons
                     aria-label="Select page of items"></mat-paginator>
    </div>
  `,
})

export class GithubIssuesTable {
  private readonly router = inject(Router);
  protected readonly cols = ['id', 'created_at', 'title', 'labels'];

  /**
   * Represents the current route query parameters as a signal
   * @protected
   */
  protected readonly params = toSignal(inject(ActivatedRoute).queryParams);

  /**
   * Resource loader
   * @protected
   */
  protected readonly issues = httpResource<GithubIssuesResponse>(
    () => {
      const p = this.params() as QueryParams;

      // Validate required parameters
      if (!p?.org || !p?.repo) {
        return undefined;
      }

      const param = new URLSearchParams();
      param.set('q', `repo:${p.org}/${p.repo}`);
      param.set('page', String(parseInt(p.page ?? '0') + 1));

      return `https://api.github.com/search/issues?${param.toString()}`;
    }
  );

  protected readonly items = computed<GithubIssuesItem[]>(() => {
    if (!this.issues.hasValue()) {
      return [];
    }
    return (this.issues.value() as GithubIssuesResponse).items;
  });

  protected readonly total = computed<number>(() => (this.issues.hasValue() ? this.issues.value()?.total_count : 0) ?? 0)

  protected readonly skeleton: SkeletonTableDesc = {
    cols: [
      {title: 'ID', width: 'w-1/8'},
      {title: 'Created', width: 'w-1/8'},
      {title: 'Title', width: 'w-3/8'},
      {title: 'Labels', width: 'w-3/8'},
    ],
    rows: 30,
  };

  protected pageChange(e: PageEvent) {
    return this.router.navigate([], {
      queryParams: {
        page: e.pageIndex
      },
      queryParamsHandling: 'merge',
    });
  }
}

export default GithubIssuesTable;
