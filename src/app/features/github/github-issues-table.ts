import {Component, computed, inject} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {httpResource} from '@angular/common/http';
import {DatePipe, JsonPipe} from '@angular/common';
import {GithubFilters} from './components/github-filters';
import {type GithubIssueLabel, GithubLabels} from './components/github-labels';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {GithubTableSkeleton} from './components/github-table-skeleton';

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
  imports: [
    MatTableModule,
    MatSortModule,
    JsonPipe,
    GithubFilters,
    DatePipe,
    GithubLabels,
    MatPaginator,
    GithubTableSkeleton,
  ],
  styles: `
    th {
      position: sticky;
      top: 0; /* Sticks the header to the top of the container */
      background-color: #fff; /* Add background color to prevent content from showing through */
      z-index: 1; /* Ensures header is above other table content */
    }
  `,
  template: `
    <div class="shadow-lg rounded-lg overflow-y-auto">
      <app-github-filters/>

      @if (issues.isLoading()) {
        <!-- Loading State -->
        <app-github-table-skeleton/>

      } @else if (issues.error()) {
        <!-- Error State -->
        <p class="text-red-600">An error occurred:</p>
        <div>
          <pre>{{ issues.error() | json }}</pre>
        </div>

      } @else if (issues.hasValue() && items().length === 0) {
        <!-- Empty State -->
        <p>No issues found...</p>

      } @else if (issues.hasValue() && items().length > 0) {
        <!-- Data Loaded State -->

        <div style="max-height:calc(100vh - 15rem);overflow-y: auto">
          <table mat-table [dataSource]="items()">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let e">{{ e['id'] }}</td>
            </ng-container>

            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let e" class="text-nowrap">{{ e['created_at'] | date }}</td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let e">{{ e['title'] }}</td>
            </ng-container>

            <ng-container matColumnDef="labels">
              <th mat-header-cell *matHeaderCellDef>Labels</th>
              <td mat-cell *matCellDef="let e">
                <app-github-labels [labels]="e['labels']"/>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols" style="position: sticky"></tr>
            <tr mat-row *matRowDef="let row; columns: cols"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[30]"
                       [hidePageSize]="true"
                       [length]="issues.value().total_count"
                       [pageIndex]="params()?.['pageIndex'] || 0"
                       [pageSize]="params()?.['pageSize'] || 5"
                       (page)="pageChange($event)"
                       showFirstLastButtons
                       aria-label="Select page of items"></mat-paginator>
      } @else {
        <!-- Initial State -->
        <p>Make sure you enter an organization and repository.</p>
      }

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
      param.set('page', (parseInt(p.page ?? '0') + 1).toString());

      return `https://api.github.com/search/issues?${param.toString()}`;
    }
  );

  protected readonly items = computed<GithubIssuesItem[]>(() => {
    if (!this.issues.hasValue()) {
      return [];
    }
    return (this.issues.value() as GithubIssuesResponse).items;
  });

  protected pageChange(e: PageEvent) {
    return this.update({
      page: e.pageSize
    })
  }

  private update(queryParams: Record<string, unknown>) {
    return this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}

export default GithubIssuesTable;
