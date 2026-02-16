import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

@Component({
    selector: 'app-task-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './task-create.component.html',
    styles: []
})
export class TaskCreateComponent implements OnInit {
    private fb = inject(FormBuilder);
    private taskService = inject(TaskService);
    private projectService = inject(ProjectService);
    private router = inject(Router);

    createForm: FormGroup;
    projects: Project[] = [];

    constructor() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            projectId: [null, Validators.required],
            description: [''],
            status: ['ToDo', Validators.required],
            dueDate: [null],
            completedDate: [null]
        });
    }

    ngOnInit(): void {
        this.projectService.getProjects().subscribe({
            next: (data) => this.projects = data,
            error: (err) => console.error('Failed to load projects', err)
        });

        // Watch for status changes to toggle completedDate requirement
        this.createForm.get('status')?.valueChanges.subscribe(value => {
            const completedDateControl = this.createForm.get('completedDate');
            if (value === 'Completed') {
                completedDateControl?.setValidators([Validators.required]);
            } else {
                completedDateControl?.clearValidators();
                completedDateControl?.setValue(null); // Optional: Reset value if not completed
            }
            completedDateControl?.updateValueAndValidity();
        });
    }

    onSubmit(): void {
        if (this.createForm.valid) {
            this.taskService.createTask(this.createForm.value).subscribe({
                next: () => {
                    // Redirect to View All
                    this.router.navigate(['/tasks/list']);
                },
                error: (err) => console.error('Failed to create task', err)
            });
        } else {
            this.createForm.markAllAsTouched();
        }
    }
}
