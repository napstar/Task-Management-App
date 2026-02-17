import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskCreateComponent } from './components/tasks/task-create/task-create.component';
import { TaskEditComponent } from './components/tasks/task-edit/task-edit.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { CreateProjectComponent } from './components/projects/create-project/create-project.component';
import { EditProjectComponent } from './components/projects/edit-project/edit-project.component';
import { ProjectListComponent } from './components/projects/project-list/project-list.component';
import { LoginComponent } from './components/login/login.component';

// Custom guard to redirect to /login instead of Azure AD
const requireLoginGuard = () => {
    const authService = inject(MsalService);
    const router = inject(Router);

    if (authService.instance.getActiveAccount() || authService.instance.getAllAccounts().length > 0) {
        return true;
    }

    return router.parseUrl('/login');
};

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [requireLoginGuard], // Use custom guard
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'tasks/create', component: TaskCreateComponent },
            { path: 'tasks/edit/:id', component: TaskEditComponent },
            { path: 'tasks/list', component: TaskListComponent },
            { path: 'projects/create', component: CreateProjectComponent },
            { path: 'projects/edit/:id', component: EditProjectComponent },
            { path: 'projects', component: ProjectListComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    // Fallback
    { path: '**', redirectTo: '' }
];
