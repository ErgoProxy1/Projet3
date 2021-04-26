import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/authService/auth.service';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-avatar-menu',
  templateUrl: './avatar-menu.component.html',
  styleUrls: ['./avatar-menu.component.scss']
})
export class AvatarMenuComponent implements OnInit, OnDestroy {

  @Input() imageDimension? = '4rem';
  @Input() statusDimension? = '1rem';
  @Input() placement? = 'bottom';

  @Output() disconnect = new EventEmitter<void>();
  @Output() profile = new EventEmitter<void>();

  dndSub: Subscription;

  isDoNotDisturb: boolean = false;

  constructor(
    public auth: AuthService,
    public socket: SocketService,
    private _change: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.dndSub = this.socket.doNotDisturbObservable.subscribe((data: boolean) => {
      this.isDoNotDisturb = data;
      this._change.detectChanges();
    })
    this.socket.emit('is-do-not-disturb', this.auth.username);
  }

  ngOnDestroy() {
    this.dndSub.unsubscribe();
  }

  toggleDoNotDisturb(){
    this.isDoNotDisturb ? this.socket.emit('set-do-not-disturb', this.auth.username) : this.socket.emit('unset-do-not-disturb', this.auth.username);
  }

}
