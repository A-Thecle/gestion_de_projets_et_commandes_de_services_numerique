import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactRapideComponent } from './contact-rapide.component';

describe('ContactRapideComponent', () => {
  let component: ContactRapideComponent;
  let fixture: ComponentFixture<ContactRapideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactRapideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactRapideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
