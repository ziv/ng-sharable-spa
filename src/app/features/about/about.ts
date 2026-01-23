import {Component} from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <div class="flex items-center justify-center">
      <div class="p-8 rounded-lg shadow-lg">
        <h1 class="text-xl pt-4">About this application</h1>
        <p>Educational Angular application demonstrating various features and best practices.</p>
        <p>Use <kbd>CTRL+S</kbd> for opening settings.</p>

        <h2 class="text-lg pt-4">Share page state</h2>
        <p>Using URL query parameters to share the current state of the page (filters, sorting, pagination).</p>

        <h3 class="text-lg pt-4">Signal form</h3>
        <p>Example of using Angular's signal-based forms with validation.</p>

        <h3 class="text-lg pt-4">View transitions</h3>
        <p>Smooth transitions between views using Angular's view transition API.</p>

        <h3 class="text-lg pt-4">Pipes and Interceptors</h3>
        <p>....</p>
      </div>
    </div>
  `,
})
export class About {

}

export default About;
