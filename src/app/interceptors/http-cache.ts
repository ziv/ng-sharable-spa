import type {HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';
import {of, tap} from 'rxjs';
import {inject} from '@angular/core';
import {AppSettings} from '../app.settings';

type CacheEntry = {
  timestamp: number;
  data: unknown;
};

function isCacheEntry(obj: unknown): obj is CacheEntry {
  return obj !== null
    && typeof obj === 'object'
    && 'timestamp' in obj
    && 'data' in obj;
}

/**
 * Simple HTTP caching mechanism
 *
 * It caches GET requests in sessionStorage for a duration defined in app settings.
 * It not ensure cache size limits or eviction policies beyond TTL expiration.
 * Do not use in production without further enhancements.
 *
 * In the app, hit `ctrl+s` to open settings and toggle caching options.
 *
 * @param req
 * @param next
 */
export function httpCache(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (req.method !== 'GET') {
    return next(req);
  }

  const settings = inject(AppSettings).settings();

  if (!settings.useCache) {
    return next(req);
  }

  const key = `http-cache-${req.urlWithParams}`;
  const cached = sessionStorage.getItem(key);

  if (cached) {
    try {
      const entry = JSON.parse(cached) as CacheEntry;
      if (isCacheEntry(entry) && Date.now() - entry.timestamp < settings.cacheTTL) {
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

      // expired or invalid cache entry
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
