import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/authService/auth.service';
import { CanvasControllerService } from 'src/app/services/canvasController/canvas-controller.service';
import { ColorService, DEFAULT_PREVIOUS_COLORS } from 'src/app/services/colorService/color.service';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Color, MAX_ALPHA } from '../../../../services/utils/color';
import { PALETTE_CHOICES_RGB } from '../../../../services/utils/constantsAndEnums';

@Component({
  selector: 'app-color-tool',
  templateUrl: './color-tool.component.html',
  styleUrls: ['./color-tool.component.scss'],
})
export class ColorToolComponent {
  readonly _PALETTE_CHOICES_RGB: Color[] = PALETTE_CHOICES_RGB;

  @ViewChild('paletteModal', { static: true }) paletteModal: ElementRef;

  paletteModalConfig: NgbModalOptions = {
    backdrop: 'static',
    centered: true,
    keyboard: false,
  };

  paletteForm: FormGroup;
  rgbaPrimaryColor: Color = Color.copyColor(Color.WHITE);
  currentPrimaryHex = '#000000';
  currentHexSelectedColor = '';
  primaryAlpha = 1;
  currentAlpha = 1;

  primarySelected = false;
  hexError = false;
  rgbaError = false;

  lastColorsUsed: Color[] = [];

  constructor(private formBuilder: FormBuilder, private controller: CanvasControllerService, private modalService: NgbModal,
    public keyboardService: KeyboardService, private toolsService: ToolsService,
    private colorService: ColorService, public auth: AuthService, public tutorial: TutorialService, public game: GameService) {

    this.paletteForm = this.formBuilder.group({
      hex: ['000000'],
      red: [0], green: [0], blue: [0],
    });
    this.colorService.previousColors = DEFAULT_PREVIOUS_COLORS.map(color => (new Color(color.r, color.g, color.b, color.a)))
    this.toolsService.primaryColor.changeColor(Color.copyColor(Color.BLACK), 1);
    this.rgbaPrimaryColor = this.toolsService.primaryColor;
    this.lastColorsUsed = this.colorService.previousColors;
    this.currentPrimaryHex = this.colorService.convertRgbToHex(this.rgbaPrimaryColor, true);
    this.primaryAlpha = this.rgbaPrimaryColor.a;
    this.rgbaConversion();
  }

  // Indique que l'utilisateur modifie la couleur primaire
  colorPrimarySelected(): void {
    this.primarySelected = true;
    this.paletteForm.patchValue({
      hex: this.currentPrimaryHex.split('#')[1],
      red: this.rgbaPrimaryColor.r,
      green: this.rgbaPrimaryColor.g,
      blue: this.rgbaPrimaryColor.b,
    });
    this.currentHexSelectedColor = this.currentPrimaryHex;
  }

  // Determine la couleur cliquer sur la palette
  getClickedColor(color: Color): void {
    this.currentHexSelectedColor = this.colorService.convertRgbToHex(color, false);
    this.paletteForm.patchValue({ hex: this.currentHexSelectedColor });
    this.confirmHexColor();
    this.confirmRGBColor();
    this.validateAlpha();
  }

  // Determine la couleur cliquer sur la l'historique des couleurs choisies
  getStackColor(mouseEvent: MouseEvent, color: Color): void {
    if (mouseEvent.button === 0) {
      this.currentPrimaryHex = this.colorService.convertRgbToHex(color, true);
      this.rgbaConversion();
    }
  }

  // Applique la couleur aprés l'évènement Click sur OK
  applyClickedColor(): void {
    const buffer: Color = this.colorService.convertHextoRgb(this.paletteForm.value.hex);
    if (this.primarySelected && !this.hexError) {
      this.currentPrimaryHex = this.colorService.convertRgbToHex(buffer, true);
      this.rgbaConversion();
      this.addNewColor(buffer);
      this.toolsService.primaryColor = this.rgbaPrimaryColor;
    }
  }

  // Confirme les valeurs hex et update les valeurs RGB du formulaire
  confirmHexColor(): void {
    const currentHex: string = this.colorService.correctHexInput(this.paletteForm.value.hex.toUpperCase());
    const currentRgbaSelectedColor: Color = this.colorService.convertHextoRgb(currentHex);
    this.correctEmptyRGBInput();
    this.paletteForm.patchValue({
      red: currentRgbaSelectedColor.r,
      green: currentRgbaSelectedColor.g,
      blue: currentRgbaSelectedColor.b,
    });
    this.paletteForm.patchValue({ hex: currentHex });
    if (this.paletteForm.value.hex.length === 6) {
      this.currentHexSelectedColor = `#${currentHex}`;
      this.hexError = false;
    } else {
      this.hexError = true;
    }
  }

  // Confirme les valeurs RGB et update les valeurs hex du formulaire
  confirmRGBColor(): void {
    this.correctEmptyRGBInput();
    this.validateRGBRange();
    const currentRGB: Color = new Color(
      this.paletteForm.value.red,
      this.paletteForm.value.green,
      this.paletteForm.value.blue,
    );
    if (currentRGB.r !== null && currentRGB.g !== null && currentRGB.b !== null) {
      this.rgbaError = false;
      this.hexError = this.rgbaError;
      const converted: string = this.colorService.convertRgbToHex(currentRGB, false);
      this.paletteForm.patchValue({
        hex: converted,
        red: currentRGB.r,
        green: currentRGB.g,
        blue: currentRGB.b,
      });
      this.currentHexSelectedColor = this.colorService.convertRgbToHex(currentRGB, true);
    } else {
      this.rgbaError = true;
    }
  }

  validateRGBRange(): void {
    if (this.paletteForm.value.red > 255) {
      this.paletteForm.patchValue({ red: 255 });
    } else if (this.paletteForm.value.red < 0) {
      this.paletteForm.patchValue({ red: 0 });
    }

    if (this.paletteForm.value.green > 255) {
      this.paletteForm.patchValue({ green: 255 });
    } else if (this.paletteForm.value.green < 0) {
      this.paletteForm.patchValue({ green: 0 });
    }

    if (this.paletteForm.value.blue > 255) {
      this.paletteForm.patchValue({ blue: 255 });
    } else if (this.paletteForm.value.blue < 0) {
      this.paletteForm.patchValue({ blue: 0 });
    }
  }

  // Verifie et assigne les valeurs alpha
  validateAlpha(): void {
    if (this.primaryAlpha > MAX_ALPHA) {
      this.primaryAlpha = MAX_ALPHA;
    } else if (this.primaryAlpha < 0) {
      this.primaryAlpha = 0;
    }

    this.rgbaConversion();
  }

  correctEmptyRGBInput(): void {
    if (isNaN(this.paletteForm.value.red)) {
      this.paletteForm.patchValue({ red: 0 });
    }

    if (isNaN(this.paletteForm.value.green)) {
      this.paletteForm.patchValue({ green: 0 });
    }

    if (isNaN(this.paletteForm.value.blue)) {
      this.paletteForm.patchValue({ blue: 0 });
    }
  }

  // Convertie les valeurs hexademiales en RGB avant de les passer aux objets Color (Communication avec le tool service)
  rgbaConversion(): void {
    const rgb1: Color = this.colorService.convertHextoRgb(this.currentPrimaryHex.split('#')[1]);
    this.rgbaPrimaryColor.changeColor(rgb1, this.primaryAlpha);
    if(this.tutorial.curState === 2){
      this.tutorial.nextStep();
    }
  }

  // Ajoute une couleur a la liste des couleurs deja utiliser.
  addNewColor(colorSelected: Color): void {
    this.colorService.addNewColor(colorSelected);
    this.lastColorsUsed = this.colorService.previousColors;
  }

  // Envoie la couleur primaire au canvas afin de changer la couleur de fond
  setBackgroundColor(): void {
    this.controller.changeBackgroundColor(this.rgbaPrimaryColor);
  }

  // Ouvre la fenetre modale
  openModal(): void {
    this.keyboardService.modalWindowActive = true;
    this.modalService.open(this.paletteModal, this.paletteModalConfig);
  }

  // Ferme la fenetre modale
  closeModal(): void {
    this.keyboardService.modalWindowActive = false;
    this.modalService.dismissAll();
    this.hexError = false;
  }
}
