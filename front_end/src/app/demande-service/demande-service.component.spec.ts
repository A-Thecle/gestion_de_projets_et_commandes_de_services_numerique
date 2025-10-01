import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeServiceComponent } from './demande-service.component';

describe('DemandeServiceComponent', () => {
  let component: DemandeServiceComponent;
  let fixture: ComponentFixture<DemandeServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
