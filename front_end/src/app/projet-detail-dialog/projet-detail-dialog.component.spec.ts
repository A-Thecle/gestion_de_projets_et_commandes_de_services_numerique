import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDetailDialogComponent } from './projet-detail-dialog.component';

describe('ProjetDetailDialogComponent', () => {
  let component: ProjetDetailDialogComponent;
  let fixture: ComponentFixture<ProjetDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
