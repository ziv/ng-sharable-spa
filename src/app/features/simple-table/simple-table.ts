import {Component, computed, effect, inject, signal} from '@angular/core';
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
import {JsonPipe} from '@angular/common';
import {TableSkeleton} from '../../components/table-skeleton';

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
    HighlightSearch,
    JsonPipe,
    TableSkeleton
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
    <div class="shadow-lg rounded-lg">

      <mat-form-field class="w-full">
        <mat-label>Search</mat-label>
        <input matInput type="text" placeholder="..." [field]="userInputForm.filter"/>
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      @if (items.error()) {
        <!--
        --------------------------------------------------------------------------
        Error State
        --------------------------------------------------------------------------
        -->
        <div>
          <p class="text-red-400">An error occurred while loading data:</p>
          <pre>{{ items.error() | json }}</pre>
        </div>
      } @else if (items.isLoading()) {
        <!--
        --------------------------------------------------------------------------
        Loading State
        --------------------------------------------------------------------------
        -->
        <app-table-skeleton [desc]="skeleton()"/>
      } @else if (items.hasValue()) {
        <!--
        --------------------------------------------------------------------------
        Data Loaded State
        --------------------------------------------------------------------------
        -->
        <div style="max-height:calc(100vh - 15rem);overflow-y: auto">
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
              <td mat-cell *matCellDef="let e" class="w-1/8">{{ e['id'] }}
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell
                  mat-sort-header
                  *matHeaderCellDef>Name
              </th>
              <td mat-cell *matCellDef="let e" class="w-2/8">
                <span [innerHTML]="e['name'] | highlightSearch:userInput().filter"></span>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell
                  mat-sort-header
                  *matHeaderCellDef>Description
              </th>
              <td mat-cell *matCellDef="let e" class="w-2/8">
                <span [innerHTML]="e['description'] | highlightSearch:userInput().filter"></span>
              </td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell
                  mat-sort-header
                  *matHeaderCellDef>Price
              </th>
              <td mat-cell *matCellDef="let e" class="w-1/8">{{ e['price'] }}$
              </td>
            </ng-container>

            <ng-container matColumnDef="inStock">
              <th mat-header-cell
                  mat-sort-header
                  *matHeaderCellDef>In Stock
              </th>
              <td mat-cell *matCellDef="let e" class="w-1/8">{{ e['inStock'] ? 'Yes' : 'No' }}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell
                  mat-sort-header
                  *matHeaderCellDef>Quantity
              </th>
              <td mat-cell *matCellDef="let e" class="w-1/8">{{ e['quantity'] }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols()"></tr>
            <tr mat-row
                *matRowDef="let row; columns: cols();let i = index"
                [style.--i]="i">
            </tr>
          </table>
        </div>
      }
      <mat-paginator [pageSizeOptions]="itemsPerPage()"
                     [length]="items.value().total"
                     [pageIndex]="params()?.['pageIndex'] || 0"
                     [pageSize]="params()?.['pageSize'] || 5"
                     [disabled]="items.isLoading()"
                     (page)="pageChange($event)"
                     showFirstLastButtons
                     aria-label="Select page of items">
      </mat-paginator>
    </div>
  `,
})

export class SimpleTable {
  /**
   * Router instance used to update query parameters
   * @private
   */
  private readonly router = inject(Router);

  protected readonly pag = signal<any>({});

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
  readonly cols = signal(['name', 'description', 'id', 'price', 'inStock', 'quantity']);

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

      return `https://ziv.github.io/ng-sharable-spa/table.json?${param.toString()}`;
    },
    {defaultValue: {items: [], total: 0}},
  );

  protected readonly skeleton = computed(() => ({
    cols: [
      {title: 'Name', width: 'w-2/8'},
      {title: 'Description', width: 'w-2/8'},
      {title: 'ID', width: 'w-1/8'},
      {title: 'Price', width: 'w-1/8'},
      {title: 'In Stock', width: 'w-1/8'},
      {title: 'Quantity', width: 'w-1/8'},
    ],
    rows: parseInt(this.params()?.['pageSize'] || '5', 10),
  }));

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
