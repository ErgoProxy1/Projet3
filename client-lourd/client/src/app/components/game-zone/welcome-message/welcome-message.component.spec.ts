import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { KeyboardService } from 'src/app/services/keyboard/keyboard.service';
import { UserInfoService } from 'src/app/services/userInfo/userinfo.service';
import { WelcomeMessageComponent } from './welcome-message.component';

describe('WelcomeMessageComponent', () => {
  let component: WelcomeMessageComponent;
  let fixture: ComponentFixture<WelcomeMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WelcomeMessageComponent],
      imports: [NgbModule],
      providers: [CookieService],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Modal properly set to active on init', () => {
    const userInfo: UserInfoService = TestBed.inject(UserInfoService);
    const keyboardService: KeyboardService = TestBed.inject(KeyboardService);
    userInfo.noMessage = false;
    keyboardService.modalWindowActive = false;
    component.ngOnInit();
    expect(keyboardService.modalWindowActive).toBe(true);
  });

  it('Modal stays inactive on init if user asked it to', () => {
    const userInfo: UserInfoService = TestBed.inject(UserInfoService);
    const keyboardService: KeyboardService = TestBed.inject(KeyboardService);
    userInfo.noMessage = true;
    keyboardService.modalWindowActive = false;
    component.ngOnInit();
    expect(keyboardService.modalWindowActive).toBe(false);
  });

  it('Modal set to active when opened', () => {
    component.openModal();
    const keyboardService: KeyboardService = TestBed.inject(KeyboardService);
    expect(keyboardService);
    expect(keyboardService.modalWindowActive).toBe(true);
  });

  it('Modal set to inactive when closed', () => {
    component.closeModal();
    const keyboardService: KeyboardService = TestBed.inject(KeyboardService);
    expect(keyboardService.modalWindowActive).toBe(false);
  });

  it('Check box is properly ticked', () => {
    const userInfo: UserInfoService = TestBed.inject(UserInfoService);
    userInfo.noMessage = false;
    component.tickCheckBox();
    expect(userInfo.noMessage).toBe(true);

    component.tickCheckBox();
    expect(userInfo.noMessage).toBe(false);
  });
});
