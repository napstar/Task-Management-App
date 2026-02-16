import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';

@Component({
    selector: 'app-create-project',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './create-project.component.html',
    styles: []
})
export class CreateProjectComponent {
    private fb = inject(FormBuilder);
    private projectService = inject(ProjectService);
    private router = inject(Router);

    createForm: FormGroup;

    constructor() {
        this.createForm = this.fb.group({
            projectName: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            projectLeadAdOid: [''],
            isActive: [true]
        });
    }

    onSubmit(): void {
        if (this.createForm.valid) {
            this.projectService.createProject(this.createForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/projects']);
                },
                error: (err) => console.error('Failed to create project', err)
            });
        } else {
            this.createForm.markAllAsTouched();
        }
    }
}
