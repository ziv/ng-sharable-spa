import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, withHashLocation, withViewTransitions} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {routes} from './app.routes';
import {fakeServer} from './interceptors/fake-server';
import {httpCache} from './interceptors/http-cache';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        fakeServer, // mock backend
        httpCache, // simple in-memory HTTP cache (use ctrl+s to open settings and disable it)
      ]),
    ),
    provideRouter(
      routes,
      withHashLocation(), // to enable hash-based routing for GitHub pages
      withViewTransitions(), // provide view transitions on route changes
    )
  ]
};
