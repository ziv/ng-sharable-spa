import {Component, effect, inject, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {httpResource} from '@angular/common/http';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {debounce, Field, form} from '@angular/forms/signals';
import {HighlightSearch} from '../../pipes/highlight';

export type TableItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  quantity: number;
  tags: string[];
}

export type TableResponse = {
  items: TableItem[];
  total: number;
}

export type QueryParams = {
  sortActive: string;
  sortDirection: 'asc' | 'desc';
  pageIndex: number;
  pageSize: number;
  filter: string;
}

@Component({
  selector: 'app-main-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginator,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
    MatSuffix,
    Field,
    HighlightSearch
  ],
  template: `
    <div class="shadow-lg rounded-lg">

      <mat-form-field class="w-full">
        <mat-label>Search</mat-label>
        <input matInput type="text" placeholder="..." [field]="userInputForm.filter"/>
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <table mat-table
             matSort
             matSortDisableClear
             [matSortActive]="params()?.['sortActive']"
             [matSortDirection]="params()?.['sortDirection']"
             [dataSource]="items.value().items"
             (matSortChange)="sortChange($event)">


        <ng-container matColumnDef="id">
          <th mat-header-cell
              mat-sort-header
              *matHeaderCellDef>ID
          </th>
          <td mat-cell *matCellDef="let e">{{ e['id'] }}
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell
              mat-sort-header
              *matHeaderCellDef>Name
          </th>
          <td mat-cell *matCellDef="let e" class="w-2xs">
            <span [innerHTML]="e['name'] | highlightSearch:userInput().filter"></span>
          </td>
        </ng-container>

        <ng-container matColumnDef="description">
          <th mat-header-cell
              mat-sort-header
              *matHeaderCellDef>Description
          </th>
          <td mat-cell *matCellDef="let e" class="w-xl">
            <span [innerHTML]="e['description'] | highlightSearch:userInput().filter"></span>
          </td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell
              mat-sort-header
              *matHeaderCellDef>Price
          </th>
          <td mat-cell *matCellDef="let e">{{ e['price'] }}$
          </td>
        </ng-container>

        <ng-container matColumnDef="inStock">
          <th mat-header-cell
              mat-sort-header
              *matHeaderCellDef>In Stock
          </th>
          <td mat-cell *matCellDef="let e">{{ e['inStock'] ? 'Yes' : 'No' }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols()"></tr>
        <tr mat-row *matRowDef="let row; columns: cols();"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="itemsPerPage()"
                     [length]="items.value().total"
                     [pageIndex]="params()?.['pageIndex'] || 0"
                     [pageSize]="params()?.['pageSize'] || 5"
                     (page)="pageChange($event)"
                     showFirstLastButtons
                     aria-label="Select page of items">
      </mat-paginator>
    </div>
  `,
  styles: ``,
})

export class SimpleTable {
  /**
   * Router instance used to update query parameters
   * @private
   */
  private readonly router = inject(Router);


  /**
   * Represent the user input
   * @protected
   */
  protected readonly userInput = signal<{ filter: string }>({filter: ''});

  /**
   * Form for user input with debounce on filter change
   * @protected
   */
  protected readonly userInputForm = form(this.userInput, (s) => {
    debounce(s.filter, 300);
  });

  /**
   * Represents the current route query parameters as a signal
   * @protected
   */
  protected readonly params = toSignal(inject(ActivatedRoute).queryParams);

  /**
   * List of columns to display
   */
  readonly cols = signal(['name', 'description', 'id', 'price', 'inStock']);

  /**
   * Items per page options (paginator)
   */
  readonly itemsPerPage = signal<number[]>([5, 10]);

  /**
   * Resource loader
   * @protected
   */
  protected readonly items = httpResource<TableResponse>(
    () => {
      const param = new URLSearchParams();
      const p = this.params() as QueryParams;

      param.set('sortActive', p?.sortActive ?? 'id');
      param.set('sortDirection', p?.sortDirection ?? 'asc');
      param.set('pageIndex', String(p?.pageIndex ?? 0));
      param.set('pageSize', String(p?.pageSize ?? 5));
      param.set('filter', p?.filter ?? '');

      return `http://localhost:4200/table.json?${param.toString()}`;
    },
    {defaultValue: {items: [], total: 0}},
  );


  constructor() {
    effect(async () => {
      await this.filterChange(this.userInput().filter);
    });
  }


  /**
   * Convert sort event into route change
   * @param e
   * @protected
   */
  protected sortChange(e: Sort) {
    return this.update({
      sortActive: e.active,
      sortDirection: e.direction
    })
  }

  /**
   * Convert page event into route change
   * @param e
   * @protected
   */
  protected pageChange(e: PageEvent) {
    return this.update({
      pageIndex: e.pageIndex,
      pageSize: e.pageSize
    })
  }

  /**
   * Handle filter change
   * @param filter
   * @protected
   */
  protected filterChange(filter: string) {
    return this.update({
      pageIndex: 0,
      filter,
    });
  }

  /**
   * Update route query parameters
   * @param queryParams
   * @private
   */
  private update(queryParams: Record<string, unknown>) {
    return this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}

export default SimpleTable;
