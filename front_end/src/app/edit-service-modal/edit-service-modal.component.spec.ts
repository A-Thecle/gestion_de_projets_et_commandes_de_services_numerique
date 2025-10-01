import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServiceModalComponent } from './edit-service-modal.component';

describe('EditServiceModalComponent', () => {
  let component: EditServiceModalComponent;
  let fixture: ComponentFixture<EditServiceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditServiceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
