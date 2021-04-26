import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'trustHTML',
})
export class TrustPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(stringToTrust: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustResourceUrl(stringToTrust);
  }

}
