import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, Project } from '../../../services/task.service';

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
    private router = inject(Router);

    createForm: FormGroup;
    projects: Project[] = [];

    constructor() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            projectId: [null, Validators.required],
            description: [''],
            status: ['ToDo', Validators.required],
            dueDate: [null]
        });
    }

    ngOnInit(): void {
        this.taskService.getProjects().subscribe({
            next: (data) => this.projects = data,
            error: (err) => console.error('Failed to load projects', err)
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
