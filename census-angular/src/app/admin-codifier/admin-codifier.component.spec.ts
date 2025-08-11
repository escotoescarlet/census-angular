import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCodifierComponent } from './admin-codifier.component';

describe('AdminCodifierComponent', () => {
  let component: AdminCodifierComponent;
  let fixture: ComponentFixture<AdminCodifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCodifierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCodifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
