import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemoignagesAdminComponent } from './temoignages-admin.component';

describe('TemoignagesAdminComponent', () => {
  let component: TemoignagesAdminComponent;
  let fixture: ComponentFixture<TemoignagesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemoignagesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemoignagesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
