import type {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';
import {map} from 'rxjs';
import type {TableItem} from '../features/simple-table/simple-table';

function handleTableJson(items: TableItem[], url: string) {
  const searchParams = new URL(url).searchParams;

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
  return {
    total,
    items: items.slice(start, end)
  };
}

/**
 * Emulate pagination, sorting, and filtering on a fake data.
 *
 * @param req
 * @param next
 */
export function fakeServer(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const obs = next(req);

  if (!req.url.includes('/table.json')) {
    return obs;
  }

  return obs.pipe(
    map(e => {
      if (e instanceof HttpResponse) {
        console.log('Fake server handling ', e.url);
        return new HttpResponse({
          body: handleTableJson(e.body as TableItem[], e.url as string),
          status: 200,
          url: req.urlWithParams,
        });
      }
      return e;
    })
  );
}
