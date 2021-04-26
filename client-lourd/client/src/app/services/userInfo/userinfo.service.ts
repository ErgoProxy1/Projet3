import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})

export class UserInfoService {

  noMessage: boolean;

  constructor(private cookieService: CookieService) {
    this.noMessage = this.getWelcomeModalCookieValue();
  }

  private getWelcomeModalCookieValue(): boolean {
    // Si le cookie n'existe pas
    if (!this.cookieService.check('noShow')) {
      return false;
    } else {
      return this.cookieService.get('noShow') === 'true';
    }
  }

  tickCheckBox(): void {
    this.noMessage = !this.noMessage;
    this.setCheckboxCookieValue();
  }

  setCheckboxValue(isClicked: boolean): void {
    this.noMessage = isClicked;
    this.setCheckboxCookieValue();
  }

  private setCheckboxCookieValue(): void {
    this.cookieService.set('noShow', this.noMessage ? 'true' : 'false');
  }

  // Méthode publique pour le component Welcome Message
  getNoMessage(): boolean {
    return this.noMessage;
  }
}
