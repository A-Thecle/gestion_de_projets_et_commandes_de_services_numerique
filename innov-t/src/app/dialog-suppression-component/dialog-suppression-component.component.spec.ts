import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSuppressionComponent } from './dialog-suppression.component';

describe('DialogSuppressionComponentComponent', () => {
  let component: DialogSuppressionComponent;
  let fixture: ComponentFixture<DialogSuppressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSuppressionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSuppressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
