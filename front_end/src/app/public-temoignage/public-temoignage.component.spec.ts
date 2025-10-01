import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTemoignageComponent } from './public-temoignage.component';

describe('PublicTemoignageComponent', () => {
  let component: PublicTemoignageComponent;
  let fixture: ComponentFixture<PublicTemoignageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTemoignageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicTemoignageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
