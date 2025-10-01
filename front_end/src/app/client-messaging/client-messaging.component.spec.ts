import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMessagingComponent } from './client-messaging.component';

describe('ClientMessagingComponent', () => {
  let component: ClientMessagingComponent;
  let fixture: ComponentFixture<ClientMessagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMessagingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
