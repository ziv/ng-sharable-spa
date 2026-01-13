import type {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';
import {of, tap} from 'rxjs';

/**
 * Simple HTTP caching mechanism.
 *
 * @param req
 * @param next
 */
export function httpCache(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.method !== 'GET') {
    return next(req);
  }

  const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  const key = `http-cache-${req.urlWithParams}`;
  const cached = sessionStorage.getItem(key);

  if (cached) {
    try {
      const entry = JSON.parse(cached) as { timestamp: number; data: unknown };
      if (Date.now() - entry.timestamp < CACHE_DURATION) {
        console.log('Serving from cache:', req.urlWithParams);
        return of(
          new HttpResponse({
            body: entry.data,
            status: 200,
            statusText: 'OK (from cache)',
            url: req.urlWithParams,
          }),
        );
      }
      // expired cache entry
      sessionStorage.removeItem(key);
    } catch {
      // invalid cache entry
      sessionStorage.removeItem(key);
    }
  }
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const entry = {
          timestamp: Date.now(),
          data: event.body,
        };
        try {
          sessionStorage.setItem(key, JSON.stringify(entry));
        } catch (err) {
          console.warn('Failed to store HTTP cache entry:', err);
        }
      }
    }),
  );
}
