import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';

@Component({
    selector: 'app-edit-project',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './edit-project.component.html',
    styles: []
})
export class EditProjectComponent implements OnInit {
    private fb = inject(FormBuilder);
    private projectService = inject(ProjectService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    editForm: FormGroup;
    projectId!: number;
    isLoading = true;

    constructor() {
        this.editForm = this.fb.group({
            projectName: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            projectLeadAdOid: [''],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.projectId = +id;
            this.loadProject(this.projectId);
        } else {
            this.router.navigate(['/projects']);
        }
    }

    loadProject(id: number): void {
        this.projectService.getProjectById(id).subscribe({
            next: (project: Project) => {
                this.editForm.patchValue({
                    projectName: project.projectName,
                    description: project.description,
                    projectLeadAdOid: project.projectLeadAdOid,
                    isActive: project.isActive
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load project', err);
                this.router.navigate(['/projects']);
            }
        });
    }

    onSubmit(): void {
        if (this.editForm.valid) {
            const updatedProject: Project = {
                projectId: this.projectId,
                ...this.editForm.value
            };

            this.projectService.updateProject(this.projectId, updatedProject).subscribe({
                next: () => {
                    this.router.navigate(['/projects']);
                },
                error: (err) => console.error('Failed to update project', err)
            });
        } else {
            this.editForm.markAllAsTouched();
        }
    }
}
