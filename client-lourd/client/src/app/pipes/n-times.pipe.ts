import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nTimes',
})
// Utiliser pour faire des ngFor un x nombre de fois. Puisqu'un ngFor se fait via un tableau,
// alors le pipe va nous retourner un tableau de taille x
export class NTimesPipe implements PipeTransform {
  private dummy = 1;
  transform(times: number): number[] {
    return (new Array(Math.floor(times))).fill(this.dummy);
  }

}
