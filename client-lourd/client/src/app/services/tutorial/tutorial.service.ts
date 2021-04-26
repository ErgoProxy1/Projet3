import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MessageHandlerService } from '../messageHandler/message-handler.service';
import { Path } from '../svgPrimitives/path/path';
import { Color } from '../utils/color';
import { MessageType, PrimitiveType } from '../utils/constantsAndEnums';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  readonly tutorialMessages: string[] = [
    'Bienvenue au tutoriel de Fais-moi un dessin! Votre premier but sera de pouvoir dessiner pour vos amis lors d\'une partie. Pour débuter, sélectionner le crayon à partir de la barre d\'outils à gauche ou avec la touche «C» sur votre clavier.', // 0, gets here from main menu component and login component, referenced in game zone component
    'Ceci est l\'outil crayon. Vous pouvez l\'utiliser pour dessiner sur le canvas au centre. Essayez-le!', // 1, gets here from pencil properties component
    'Votre dessin est bien, mais je trouve que ça manque un peu de couleur. Sélectionnez-en une! Vous pouvez choisir parmi les cinq couleurs en bas à droite, ou cliquer sur la couleur actuelle pour choisir une couleur plus précise.', //2, gets here from canvas controller service
    'Oh, c\'est ma couleur préférée! Dessinez un autre trait!', //3, gets here from color.ts
    'Wow! C\'est vraiment beau! Mais malheuresement, je vais vous demander de l\'effacer... Sélectionnez l\'outil efface, c\'est juste en dessous du crayon. Vous pouvez aussi utiliser la touche «E».', // 4, gets here from canvas controller service
    'Ceci est l\'efface. Vous devez maintenant l\'utiliser pour purger votre dessin. Prenez votre temps...', // 5, gets here from eraser properties component
    '...Fini? Superbe! Vous avez aussi accès à une grille. C\'est juste en dessous de l\'efface. Sélectionnez-la pour voir toutes les belles options.', // 6, gets here from eraser command apply method
    'Voici les options de la grille. Vous pouvez l\'afficher avec l\'option «Afficher la grille» ou en appuyant sur la touche «G» de votre clavier. Ce raccourci fonctionne peu importe l\'outil sélectionné.', //7, gets here from grid component
    'Lors d\'une partie, votre objectif lorsque vous ne dessinez pas est de deviner ce que les autres joueurs sont en train de dessiner. Essayez donc de deviner ce que ce dessin représente. Personellement, j\'ai dû y réfléchir longtemps...', //8, gets here from grid component
    'Correct! Cela conclue le tutoriel. Vous pouvez continuer à jouer avec les outils. Pour quitter, cliquez sur le bouton de retour en haut à gauche.' // 9, gets here from tools service showGrid method OR grid properties onToggleGrid method
  ]

  readonly exampleImage = [
    new Path(new Color(255,0,0), 1, PrimitiveType.Pencil),
    new Path(new Color(0,191,0), 1, PrimitiveType.Pencil)
  ]

  loadExampleImageObservable: Observable<void>;
  private _loadExampleImageSubject = new Subject<void>();

  private _curState = -1;
  get curState() {
    return this._curState;
  }

  static instance: TutorialService;
  constructor(
    private _messageHandler: MessageHandlerService
  ) { 
    TutorialService.instance = this;
    this.loadExampleImageObservable = this._loadExampleImageSubject.asObservable();
    this.exampleImage[0].commandSvg = "M 314.5 191 C 314.5 191 315.914 189.414 314.5 188 C 313.793 187.293 312.5 187 312.5 187 C 310.5 187 310.5 186 309.5 185 C 308.5 184 307.703 182.743 306.5 182 C 303.81 180.337 302.807 179.541 301.5 179 C 299.652 178.235 297.314 178.307 295.5 177 C 294.353 176.173 291.5 175 289.5 175 C 288.5 175 286.367 174.43 282.5 173 C 280.403 172.224 276.676 171.514 274.5 171 C 271.58 170.311 269.47 171.489 265.5 171 C 261.408 170.496 256.5 170 251.5 170 C 248.5 170 242.5 170 240.5 170 C 237.5 170 235.5 170 234.5 170 C 233.5 170 230.615 170.274 228.5 171 C 223.677 172.655 218.285 173.361 211.5 176 C 205.248 178.432 198.5 181 194.5 183 C 190.5 185 187.965 185.311 186.5 187 C 184.428 189.389 183.622 191.066 182.5 193 C 180.69 196.118 177.29 199.851 174.5 204 C 171.246 208.839 171.366 213.567 168.5 217 C 165.296 220.839 163.71 224.078 162.5 227 C 160.789 231.132 157.157 234.876 155.5 240 C 154.231 243.923 152.384 247.964 151.5 251 C 150.347 254.959 151.141 258.052 150.5 262 C 149.993 265.121 148.004 270.908 147.5 275 C 147.011 278.97 147.007 282.879 146.5 286 C 145.859 289.948 145.5 293 145.5 299 C 145.5 303 145.5 308 145.5 311 C 145.5 317 145.381 322.025 146.5 327 C 147.405 331.023 148.034 336.097 149.5 342 C 150.262 345.069 150.973 349.294 154.5 355 C 157.129 359.253 159.752 363.88 162.5 370 C 164.706 374.913 167.179 378.571 169.5 383 C 172.435 388.602 174.644 391.907 178.5 398 C 181.618 402.927 183.5 407 186.5 411 C 189.5 415 191.5 417 194.5 420 C 197.5 423 199.911 424.692 204.5 428 C 209.942 431.922 217.389 435.194 222.5 438 C 230.341 442.304 237.019 445.994 244.5 449 C 252.152 452.074 257.485 454.081 262.5 455 C 268.483 456.097 274.362 458.475 280.5 460 C 286.403 461.466 290.447 462.499 297.5 463 C 305.48 463.567 311.5 463 316.5 464 C 321.5 465 326.5 467 329.5 467 C 332.5 467 334.5 467 335.5 467 C 338.5 467 341.553 467.46 343.5 467 C 345.676 466.486 345.919 465.581 347.5 464 C 349.081 462.419 351.321 460.701 354.5 459 C 355.382 458.528 356.5 458 358.5 457 C 358.5 457 358.5 456 359.5 456 C 360.5 456 361.543 455.71 362.5 456 C 365.951 457.045 366.887 459.918 369.5 461 C 372.272 462.148 374.526 462.68 376.5 463 C 379.621 463.507 382.577 463.731 386.5 465 C 391.624 466.657 396.5 467 401.5 467 C 406.5 467 410.5 467 414.5 467 C 419.5 467 426.5 467 433.5 467 C 439.5 467 446.597 466.466 452.5 465 C 458.638 463.475 464.08 460.944 470.5 459 C 478.216 456.664 484.908 456.393 490.5 454 C 495.097 452.033 497.958 449.336 501.5 447 C 505.996 444.036 511.339 441.829 514.5 439 C 519.271 434.73 522.723 432.276 526.5 429 C 530.773 425.294 531.789 420.653 534.5 416 C 537.724 410.468 540.367 402.966 542.5 395 C 544.383 387.968 545.134 382.664 547.5 376 C 549.451 370.505 552.109 364.203 553.5 359 C 555.326 352.169 556.261 345.955 557.5 340 C 558.34 335.963 558.5 330 558.5 324 C 558.5 319 558.5 315 558.5 311 C 558.5 304 556.599 296.252 554.5 287 C 552.717 279.137 552.952 270.873 550.5 263 C 547.96 254.842 545.119 247.237 541.5 241 C 538.133 235.198 535.776 230.777 532.5 227 C 528.794 222.727 525.5 219 520.5 215 C 515.5 211 511.77 205.771 507.5 201 C 504.671 197.839 499.807 192.814 498.5 191 C 495.192 186.411 491.314 186.307 489.5 185 C 486.058 182.519 484.195 180.83 480.5 179 C 474.762 176.158 472.128 173.615 468.5 171 C 466.205 169.346 462.422 167.21 459.5 166 C 455.368 164.289 452.474 163.32 450.5 163 C 447.379 162.493 444.5 161 439.5 160 C 434.5 159 431.624 157.657 426.5 156 C 422.577 154.731 416.621 154.507 413.5 154 C 411.526 153.68 409.5 154 406.5 154 C 403.5 154 400.435 153.199 395.5 154 C 392.379 154.507 390.42 156.376 386.5 158 C 383.728 159.148 382.5 159 379.5 159 C 377.5 159 375.807 160.459 374.5 161 C 370.804 162.531 368.474 161.68 366.5 162 C 363.379 162.507 361.618 164.19 358.5 166 C 356.566 167.122 355.026 167.149 354.5 168 C 352.149 171.804 349.348 170.235 347.5 171 C 346.193 171.541 343.081 173.419 341.5 175 C 338.338 178.162 334.348 178.235 332.5 179 C 329.887 180.082 328.961 181.606 326.5 183 C 322.912 185.031 321.647 185.173 320.5 186 C 318.686 187.307 316.5 187 316.5 187 L 315.5 188 L 314.5 188"
    this.exampleImage[0].fillColor = new Color(255,0,0);
    this.exampleImage[1].commandSvg = "M 313.5 187 C 311.5 186 311.243 185.203 310.5 184 C 308.837 181.31 308.397 179.094 307.5 178 C 305.214 175.212 304.041 174.307 303.5 173 C 303.117 172.076 302.5 171 302.5 171 C 302.5 168 302.327 167.147 301.5 166 C 300.193 164.186 300.5 162 300.5 161 C 300.5 160 300.5 159 300.5 159 C 300.5 157 300.5 155 300.5 155 C 300.5 153 300.5 152 300.5 151 C 300.5 149 300.5 148 300.5 147 C 300.5 147 300.5 145 300.5 143 C 300.5 142 300.378 139.993 300.5 139 C 301.004 134.908 302.5 134 302.5 132 C 302.5 131 302.02 130.676 303.5 129 C 305.886 126.297 308.23 124.771 312.5 120 C 314.386 117.892 316.5 115 318.5 113 C 319.5 112 320.649 111.526 321.5 111 C 323.402 109.824 323.5 107 326.5 107 C 326.5 107 327.5 106 329.5 105 C 333.5 103 338.57 101.378 341.5 98 C 343.572 95.611 343.5 95 344.5 95 C 346.5 95 347.193 94.5412 348.5 94 C 349.424 93.6173 349.5 93 350.5 93 C 350.5 93 352.5 93 352.5 94 C 352.5 95 353.5 95 353.5 95 C 351.5 95 351.026 97.1493 350.5 98 C 349.324 99.9021 347.5 99 346.5 100 C 345.5 101 343.582 102.387 342.5 105 C 341.735 106.848 341.5 110 341.5 111 C 341.5 112 341.73 113.027 341.5 114 C 340.986 116.176 339.883 118.076 339.5 119 C 338.959 120.307 336.545 121.549 335.5 125 C 334.92 126.914 334.66 127.013 334.5 128 C 333.993 131.121 331.014 131.824 330.5 134 C 330.27 134.973 330.73 136.027 330.5 137 C 329.986 139.176 328.007 142.879 327.5 146 C 327.18 147.974 326.5 151 326.5 151 C 325.5 154 324.041 155.693 323.5 157 C 322.735 158.848 322.5 159 322.5 160 C 322.5 161 321.5 164 320.5 165 C 318.5 167 318.96 167.053 318.5 169 C 317.986 171.176 316.73 172.027 316.5 173 C 315.986 175.176 315.265 177.152 314.5 179 C 313.959 180.307 311.041 182.693 310.5 184 C 310.117 184.924 310.5 186 310.5 187 L 310.5 187"
    this.exampleImage[1].fillColor = new Color(0,191,0);
  }

  nextStep() {
    if (this._curState >= 0 && this._curState < this.tutorialMessages.length - 1) {
      this._curState += 1;
      this._messageHandler.showMessage(this.tutorialMessages[this._curState], MessageType.Info, 0, false)
    }
  }

  start() {
    this._curState = 0;
  }

  end() {
    this._curState = -1;
  }

  hasStarted() {
    return this._curState !== -1
  }

  loadExampleImage(){
    console.log('herrrreee')
    this._loadExampleImageSubject.next();
  }
}
