import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMessagingComponent } from './admin-messaging.component';

describe('AdminMessagingComponent', () => {
  let component: AdminMessagingComponent;
  let fixture: ComponentFixture<AdminMessagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMessagingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
