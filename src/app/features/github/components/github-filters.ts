import {Component, effect, inject, signal} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {debounce, Field, form} from '@angular/forms/signals';
import {Router} from '@angular/router';

@Component({
  selector: 'app-github-filters',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    Field
  ],
  host: {
    class: 'flex gap-2',
  },
  template: `
    <mat-form-field class="flex-1">
      <mat-label>Organization</mat-label>
      <input matInput type="text" placeholder="Org name" [field]="userInputForm.org"/>
    </mat-form-field>
    <mat-form-field class="flex-1">
      <mat-label>Repository</mat-label>
      <input matInput type="text" placeholder="Repo name" [field]="userInputForm.repo"/>
    </mat-form-field>`
})
export class GithubFilters {
  /**
   * Represent the user input
   * @protected
   */
  protected readonly userInput = signal<{ org: string; repo: string; }>({org: 'angular', repo: 'components'});

  /**
   * Form for user input with debounce on filter change
   * @protected
   */
  protected readonly userInputForm = form(this.userInput, (s) => {
    debounce(s.repo, 300);
    debounce(s.org, 300);
  });

  constructor() {
    // The component update the query params on user input change
    const router = inject(Router);

    effect(async () => {
      const queryParams = this.userInput();
      await router.navigate([], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    });
  }
}
