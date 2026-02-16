import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    private http = inject(HttpClient);
    private projectsUrl = `${environment.apiUrl}/projects`;

    // -------------------------------------------------------
    // GET PROJECTS FROM API
    // -------------------------------------------------------
    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(this.projectsUrl).pipe(
            tap(projects => {
                console.log("✔ Successfully loaded projects:", projects);
            }),
            catchError(err => {
                console.error("❌ Error loading projects:", err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // GET SINGLE PROJECT BY ID
    // -------------------------------------------------------
    getProjectById(id: number): Observable<Project> {
        return this.http.get<Project>(`${this.projectsUrl}/${id}`).pipe(
            tap(project => console.log(`Fetched project ${id}:`, project)),
            catchError(err => {
                console.error(`Error fetching project ${id}:`, err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // CREATE PROJECT
    // -------------------------------------------------------
    createProject(project: Partial<Project>): Observable<Project> {
        return this.http.post<Project>(this.projectsUrl, project).pipe(
            tap(newProject => console.log("✔ Created project:", newProject)),
            catchError(err => {
                console.error("❌ Error creating project:", err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // UPDATE PROJECT
    // -------------------------------------------------------
    updateProject(id: number, project: Project): Observable<void> {
        return this.http.put<void>(`${this.projectsUrl}/${id}`, project).pipe(
            tap(() => console.log(`✔ Updated project ${id}`)),
            catchError(err => {
                console.error(`❌ Error updating project ${id}:`, err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // DELETE PROJECT
    // -------------------------------------------------------
    deleteProject(id: number): Observable<void> {
        return this.http.delete<void>(`${this.projectsUrl}/${id}`).pipe(
            tap(() => console.log(`✔ Deleted project ${id}`)),
            catchError(err => {
                console.error(`❌ Error deleting project ${id}:`, err);
                return throwError(() => err);
            })
        );
    }
}
