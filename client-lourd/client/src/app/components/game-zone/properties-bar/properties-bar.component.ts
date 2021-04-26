import { Component, OnInit} from '@angular/core';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { GameService } from 'src/app/services/gameService/game-service.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';

@Component({
  selector: 'app-properties-bar',
  templateUrl: './properties-bar.component.html',
  styleUrls: ['./properties-bar.component.scss'],
})
export class PropertiesBarComponent implements OnInit{
  faQuestionCircle = faQuestionCircle;
  
  constructor(public gameService: GameService,
    public tutorial: TutorialService){

  }

  ngOnInit(){
    
  }
}
