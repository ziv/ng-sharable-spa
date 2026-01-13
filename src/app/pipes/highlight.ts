import {Pipe, PipeTransform, inject} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({name: 'highlightSearch'})
export class HighlightSearch implements PipeTransform {
  sanitizer = inject(DomSanitizer);

  transform(value: string, search: string | null | undefined): unknown {
    // first sanitize the input value to prevent XSS since are bypassing Angular's
    // built-in sanitization and guards against unsafe HTML
    value = DOMPurify.sanitize(value);
    if (!search) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }

    const re = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    const highlighted = value.replace(re, (match) => `<mark>${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
