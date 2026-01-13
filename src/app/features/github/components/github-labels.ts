import {Component, input} from '@angular/core';
import {InverseColor} from '../../../pipes/inverse-color';

export type GithubIssueLabel = {
  color: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-github-labels',
  host: {
    class: 'flex flex-wrap gap-1',
  },
  template: `
    @for (l of labels(); track l.name) {
      <span class="px-2 rounded-full text-nowrap"
            [style.background-color]="'#' + l.color"
            [style.color]="'#' + (l.color | inverseColor)">{{ l.name }}</span>
    }
  `,
  imports: [
    InverseColor
  ]
})
export class GithubLabels {
  labels = input.required<GithubIssueLabel[]>();
}
