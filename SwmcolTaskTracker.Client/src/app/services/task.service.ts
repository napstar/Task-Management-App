import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/tasks`;

    private tasksSubject = new BehaviorSubject<Task[]>([]);
    tasks$ = this.tasksSubject.asObservable();

    constructor() {
        console.log("apiUrl:", this.apiUrl);
        this.loadTasks();
    }

    // -------------------------------------------------------
    // LOAD TASKS FROM API
    // -------------------------------------------------------
    loadTasks(): void {
        this.http.get<Task[]>(this.apiUrl).pipe(
            tap(tasks => {
                console.log("✔ Successfully loaded tasks:", tasks);
                this.tasksSubject.next(tasks);
            }),
            catchError(err => {
                console.error("❌ Error loading tasks:", err);
                return throwError(() => err);
            })
        ).subscribe();
    }

    // -------------------------------------------------------
    // GET ALL TASKS (Direct API Call)
    // -------------------------------------------------------
    getAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl).pipe(
            tap(tasks => console.log('Fetched all tasks directly:', tasks)),
            catchError(err => {
                console.error('Error fetching all tasks:', err);
                return throwError(() => err);
            })
        );
    }

    getTasks(): Observable<Task[]> {
        return this.tasks$;
    }

    // -------------------------------------------------------
    // CREATE TASK (POST TO API)
    // -------------------------------------------------------
    createTask(task: Task): Observable<Task> {
        console.log("Sending task to API:", task);

        return this.http.post<Task>(this.apiUrl, task).pipe(
            tap(createdTask => {
                console.log("✔ Task successfully created:", createdTask);

                // Optional: update local state
                const currentTasks = this.tasksSubject.value;
                this.tasksSubject.next([...currentTasks, createdTask]);
            }),
            catchError(err => {
                console.error("❌ Error creating task:", err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // GET SINGLE TASK BY ID
    // -------------------------------------------------------
    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
            tap(task => console.log(`Fetched task ${id}:`, task)),
            catchError(err => {
                console.error(`Error fetching task ${id}:`, err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // UPDATE TASK (PUT)
    // -------------------------------------------------------
    updateTask(id: number, task: Task): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, task).pipe(
            tap(() => {
                console.log(`✔ Task ${id} updated successfully`);
                // Update local list if needed
                const currentTasks = this.tasksSubject.value;
                const updatedTasks = currentTasks.map(t => t.taskId === id ? task : t);
                this.tasksSubject.next(updatedTasks);
            }),
            catchError(err => {
                console.error(`❌ Error updating task ${id}:`, err);
                return throwError(() => err);
            })
        );
    }

    // -------------------------------------------------------
    // DELETE TASK
    // -------------------------------------------------------
    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                console.log(`✔ Task ${id} deleted successfully`);
                // Remove from local list
                const currentTasks = this.tasksSubject.value;
                const updatedTasks = currentTasks.filter(t => t.taskId !== id);
                this.tasksSubject.next(updatedTasks);
            }),
            catchError(err => {
                console.error(`❌ Error deleting task ${id}:`, err);
                return throwError(() => err);
            })
        );
    }
}
