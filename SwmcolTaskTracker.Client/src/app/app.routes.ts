import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskCreateComponent } from './components/tasks/task-create/task-create.component';
import { TaskEditComponent } from './components/tasks/task-edit/task-edit.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { CreateProjectComponent } from './components/projects/create-project/create-project.component';
import { EditProjectComponent } from './components/projects/edit-project/edit-project.component';
import { ProjectListComponent } from './components/projects/project-list/project-list.component';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [MsalGuard],
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
