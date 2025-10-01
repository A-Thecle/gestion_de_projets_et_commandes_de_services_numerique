import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEditDialogComponent } from './client-edit-dialog.component';

describe('ClientEditDialogComponent', () => {
  let component: ClientEditDialogComponent;
  let fixture: ComponentFixture<ClientEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
