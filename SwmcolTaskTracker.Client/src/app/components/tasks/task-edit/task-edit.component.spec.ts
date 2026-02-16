import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskEditComponent } from './task-edit.component';
import { TaskService } from '../../../services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('TaskEditComponent', () => {
  let component: TaskEditComponent;
  let fixture: ComponentFixture<TaskEditComponent>;
  let taskServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  beforeEach(async () => {
    taskServiceMock = {
      getProjects: jasmine.createSpy('getProjects').and.returnValue(of([
        { projectId: 1, projectName: 'Test Project' }
      ])),
      getTaskById: jasmine.createSpy('getTaskById').and.returnValue(of({
        taskId: 1,
        title: 'Test Task',
        projectId: 1,
        status: 'ToDo',
        description: 'Test Description'
      })),
      updateTask: jasmine.createSpy('updateTask').and.returnValue(of({}))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    routeMock = {
      snapshot: {
        paramMap: {
          get: () => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [TaskEditComponent, ReactiveFormsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.editForm).toBeDefined();
    expect(component.editForm.get('completedDate')).toBeDefined();
  });

  it('should make completedDate required when status is Completed', () => {
    const statusControl = component.editForm.get('status');
    const completedDateControl = component.editForm.get('completedDate');

    // Initially ToDo (from mock), checking patch happened
    expect(statusControl?.value).toBe('ToDo');

    // Ensure completedDate is initially valid (optional)
    completedDateControl?.setValue(null);
    expect(completedDateControl?.valid).toBeTrue();

    // Change status to Completed
    statusControl?.setValue('Completed');

    // Now it should be invalid because it's null
    expect(completedDateControl?.valid).toBeFalse();
    expect(completedDateControl?.hasError('required')).toBeTrue();

    // Set a date
    completedDateControl?.setValue('2023-10-10');
    expect(completedDateControl?.valid).toBeTrue();
  });

  it('should make completedDate optional when status is changed back from Completed', () => {
    const statusControl = component.editForm.get('status');
    const completedDateControl = component.editForm.get('completedDate');

    statusControl?.setValue('Completed');
    completedDateControl?.setValue(null);
    expect(completedDateControl?.valid).toBeFalse();

    statusControl?.setValue('InProgress');
    expect(completedDateControl?.valid).toBeTrue();
  });
});
