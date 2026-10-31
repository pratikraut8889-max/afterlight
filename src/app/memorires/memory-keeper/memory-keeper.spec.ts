import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryKeeper } from './memory-keeper';

describe('MemoryKeeper', () => {
  let component: MemoryKeeper;
  let fixture: ComponentFixture<MemoryKeeper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryKeeper],
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryKeeper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
