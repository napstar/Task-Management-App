import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskActionsRendererComponent } from './task-actions-renderer.component';

describe('TaskActionsRendererComponent', () => {
  let component: TaskActionsRendererComponent;
  let fixture: ComponentFixture<TaskActionsRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskActionsRendererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
