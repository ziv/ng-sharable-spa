import type {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';
import {delay, map} from 'rxjs';
import type {TableItem} from '../features/simple-table/simple-table';
import {inject} from '@angular/core';
import {AppSettings} from '../app.settings';

/**
 * Emulate server-side pagination, sorting, and filtering of table data using URL query parameters.
 * @param e
 */
function emulateServerResponse(e: HttpResponse<unknown>) {
  let items: TableItem[] = (e.body as TableItem[]) || [];
  const searchParams = new URL(e.url as string).searchParams;

  const sortActive = searchParams.get('sortActive') || 'id';
  const sortDirection = searchParams.get('sortDirection') || 'asc';
  const pageIndex = parseInt(searchParams.get('pageIndex') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const filter = (searchParams.get('filter') || '').toLowerCase();

  if (filter) {
    items = items.filter(i => i.name.toLowerCase().includes(filter) || i.description.toLowerCase().includes(filter));
  }

  // we always sort. there is no pagination without sorting.
  items.sort((a: any, b: any) => {
    const aValue = a[sortActive] as string | number | boolean;
    const bValue = b[sortActive] as string | number | boolean;

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const total = items.length;

  return new HttpResponse({
    body: {
      total,
      items: items.slice(start, end)
    },
    status: 200,
    url: e.url as string,
  });
}

/**
 * Emulate pagination, sorting, and filtering on a fake data on specific endpoint '/table.json'.
 *
 * In the app, hit `ctrl+s` to open settings and toggle network latency simulation.
 *
 * @param req
 * @param next
 */
export function fakeServer(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (!req.url.includes('/table.json')) {
    return next(req);
  }

  const settings = inject(AppSettings).settings();
  const latency = settings.simulateNetworkLatency ? settings.networkLatency : 0;

  return next(req).pipe(
    delay(latency), // simulate server delay (multiplied by all events in the chain, not only responses)
    map(e => (e instanceof HttpResponse) ? emulateServerResponse(e) : e),
  );
}
