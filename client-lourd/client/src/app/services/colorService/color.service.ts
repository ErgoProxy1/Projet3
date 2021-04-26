import { Injectable } from '@angular/core';
import { Color, MAX_ALPHA, MAX_RGB } from '../utils/color';

export const DEFAULT_PREVIOUS_COLORS =  [new Color(0, 0, 0, 1), new Color(255, 255, 255, 1),
  new Color(255, 0, 0, 1), new Color(0, 255, 0, 1), new Color(0, 0, 255, 1)];

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  previousColors: Color[] = DEFAULT_PREVIOUS_COLORS.map(color => (new Color(color.r, color.g, color.b, color.a)));

  // Convertie les couleurs RGB en Hex
  convertRgbToHex(color: Color, withHashtag: boolean): string {
    const hexes: string[] = [Number(color.r).toString(16).toUpperCase(),
    Number(color.g).toString(16).toUpperCase(),
    Number(color.b).toString(16).toUpperCase()];
    for (let i = 0; i < 3; i++) {
      if (hexes[i].length < 2) {
        hexes[i] = `0${hexes[i]}`;
      }
    }
    return withHashtag ? `#${hexes.join('')}` : `${hexes.join('')}`;
  }

  // Convertie les couleurs Hex en RGB
  convertHextoRgb(currentHex: string): Color {
    return new Color(parseInt(currentHex.slice(0, 2), 16),
      parseInt(currentHex.slice(2, 4), 16),
      parseInt(currentHex.slice(4, 6), 16));
  }

  // Corrige les inputs de l'utilisateur invalides dans le champ du Hex
  correctHexInput(currentHex: string): string {
    const regex: RegExp = /[^A-F0-9]/;
    return currentHex.replace(regex, '');
  }

  // S'assure que les valeurs RGB entree sont valides
  isColorValid(color: Color): boolean {
    return (color.r <= MAX_RGB && color.r >= 0 &&
      color.g <= MAX_RGB && color.g >= 0 &&
      color.b <= MAX_RGB && color.b >= 0);
  }

  // Ajoute le # aux valeurs Hex afin de pouvoir les passer au html
  stringToHexForm(hex: string): string {
    return `#${hex}`;
  }

  // Corrige les inputs de l'utilisateur invalides dans les champs du alpha
  confirmAlpha(alpha: number): number {
    return (alpha >= 0 && alpha <= MAX_ALPHA) ? alpha : 1;
  }

  // Utilisation de la stack
  addNewColor(colorSelected: Color): void {
    for (const info of this.previousColors) {
      if (info.isEquivalent(colorSelected)) {
        const index: number = this.previousColors.indexOf(info);
        this.previousColors.splice(index, 1);
        this.previousColors = this.decalageTableauCouleur(this.previousColors, info);
        return;
      }
    }
    this.previousColors = this.decalageTableauCouleur(this.previousColors, colorSelected);
  }

  // Decalage du tableau des dernieres couleurs utilisées
  private decalageTableauCouleur(oldArray: Color[], lastColor: Color): Color[] {
    const tempColorStorage: Color[] = [];
    tempColorStorage[0] = new Color(lastColor.r, lastColor.g, lastColor.b, lastColor.a);
    for (let i = 0; i < this.previousColors.length; i++) {
      tempColorStorage[i + 1] = oldArray[i];
    }
    if (tempColorStorage.length > 10) {
      tempColorStorage.pop();
    }
    return tempColorStorage;
  }
}
