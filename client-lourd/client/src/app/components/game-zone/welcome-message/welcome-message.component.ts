import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { UserInfoService } from '../../../services/userInfo/userinfo.service';

@Component({
  selector: 'app-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss'],
})

export class WelcomeMessageComponent implements OnInit {

  @ViewChild('welcomeModal', { static: true }) welcomeModal: ElementRef;

  welcomeModalConfig: NgbModalOptions = {
    backdrop: 'static',
    centered: true,
    keyboard: false,
  };

  constructor(private userInfoService: UserInfoService,
              private keyboardService: KeyboardService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    if (!this.userInfoService.getNoMessage()) {
      this.openModal();
    }
  }
  // Fonctions d'ouverture et fermeture du modal
  openModal(): void {
    this.keyboardService.modalWindowActive = true;
    this.modalService.open(this.welcomeModal, this.welcomeModalConfig);
  }

  closeModal(): void {
    this.keyboardService.modalWindowActive = false;
    this.modalService.dismissAll();
  }

  // Fonction pour la verification du checkbox
  tickCheckBox(): void {
    this.userInfoService.tickCheckBox();
  }
}
