import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'inverseColor'})
export class InverseColor implements PipeTransform {

  transform(value: string): string {
    // value is color in format "RRGGBB"
    if (!/^([0-9A-Fa-f]{6})$/.test(value)) {
      return value; // return original value if not valid
    }
    const r = 255 - parseInt(value.slice(0, 2), 16);
    const g = 255 - parseInt(value.slice(2, 4), 16);
    const b = 255 - parseInt(value.slice(4, 6), 16);
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }
}
