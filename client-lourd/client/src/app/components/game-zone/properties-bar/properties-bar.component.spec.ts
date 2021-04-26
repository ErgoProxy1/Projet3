import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ColorToolComponent } from './color-tool/color-tool.component';
import { PropertiesBarComponent } from './properties-bar.component';

describe('PropertiesBarComponent', () => {
  let component: PropertiesBarComponent;
  let fixture: ComponentFixture<PropertiesBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesBarComponent, ColorToolComponent ],
      imports: [RouterTestingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
