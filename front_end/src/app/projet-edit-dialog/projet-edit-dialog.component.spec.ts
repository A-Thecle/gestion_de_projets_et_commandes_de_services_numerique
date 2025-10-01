import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetEditDialogComponent } from './projet-edit-dialog.component';

describe('ProjetEditDialogComponent', () => {
  let component: ProjetEditDialogComponent;
  let fixture: ComponentFixture<ProjetEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
