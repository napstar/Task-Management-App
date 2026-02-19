import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { MsalService } from '@azure/msal-angular';
import { UserService, GraphUser } from '../../../services/user.service';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, catchError } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';

@Component({
    selector: 'app-create-project',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './create-project.component.html',
    styles: [`
        .dropdown-menu {
            position: absolute;
            z-index: 50;
            width: 100%;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
        }
        .dropdown-item {
            padding: 0.5rem 1rem;
            cursor: pointer;
        }
        .dropdown-item:hover {
            background-color: #f1f5f9;
        }
    `]
})
export class CreateProjectComponent {
    private fb = inject(FormBuilder);
    private projectService = inject(ProjectService);
    private router = inject(Router);
    private authService = inject(MsalService);
    private userService = inject(UserService);

    createForm: FormGroup;

    // Autocomplete
    searchQuery = new Subject<string>();
    searchResults$: Observable<GraphUser[]>;
    showDropdown = false;
    loading = false;

    constructor() {
        this.createForm = this.fb.group({
            projectName: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            projectLeadAdOid: [''],
            isActive: [true],
            ownerSearch: [''],
            projectOwnerId: [''],
            projectOwnerEmail: ['']
        });

        this.searchResults$ = this.searchQuery.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(query => {
                if (!query || query.length < 3) {
                    this.loading = false;
                    return of([]);
                }
                return this.userService.searchUsers(query).pipe(
                    catchError(err => {
                        console.error(err);
                        return of([]);
                    }),
                    finalize(() => this.loading = false)
                );
            })
        );
    }

    onSearchInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.next(value);
        this.showDropdown = true;
    }

    selectUser(user: GraphUser) {
        this.createForm.patchValue({
            ownerSearch: `${user.displayName} (${user.userPrincipalName})`,
            projectOwnerId: user.id,
            projectOwnerEmail: user.userPrincipalName
        });
        this.showDropdown = false;
        this.searchQuery.next(''); // Clear search
    }

    onSubmit(): void {
        if (this.createForm.valid) {
            const projectData = this.createForm.value;

            // Set Current User Email as Project Lead (legacy/default)
            const account = this.authService.instance.getActiveAccount();
            if (account?.username && !projectData.projectLeadAdOid) {
                projectData.projectLeadAdOid = account.username;
            }

            // Cleanup auxiliary search field before sending? 
            // API will ignore extra fields if not in model, or we can delete it.
            delete projectData.ownerSearch;

            this.projectService.createProject(projectData).subscribe({
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
