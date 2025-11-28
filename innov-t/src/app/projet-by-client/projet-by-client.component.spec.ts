import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetByClientComponent } from './projet-by-client.component';

describe('ProjetByClientComponent', () => {
  let component: ProjetByClientComponent;
  let fixture: ComponentFixture<ProjetByClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetByClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetByClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
