import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { Project } from '../../../models/project.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './project-list.component.html',
    styles: []
})
export class ProjectListComponent implements OnInit {
    private projectService = inject(ProjectService);

    projects: Project[] = [];
    paginatedProjects: Project[] = [];

    // Pagination settings
    currentPage = 1;
    pageSize = 5;
    totalPages = 0;
    totalItems = 0;
    Math = Math; // Expose Math for template

    isLoading = true;
    searchTerm = '';

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects(): void {
        this.isLoading = true;
        this.projectService.getProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.totalItems = data.length;
                this.totalPages = Math.ceil(this.totalItems / this.pageSize);
                this.updatePaginatedProjects();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load projects', err);
                this.isLoading = false;
            }
        });
    }

    updatePaginatedProjects(): void {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;

        let filtered = this.projects;
        if (this.searchTerm) {
            filtered = this.projects.filter(p =>
                p.projectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
            this.totalItems = filtered.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
            this.totalItems = this.projects.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }

        // Adjust page if out of bounds after filtering
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }

        this.paginatedProjects = filtered.slice(start, end);
    }

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedProjects();
        }
    }

    onSearch(): void {
        this.currentPage = 1;
        this.updatePaginatedProjects();
    }

    deleteProject(id: number): void {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projectService.deleteProject(id).subscribe({
                next: () => {
                    this.projects = this.projects.filter(p => p.projectId !== id);
                    this.updatePaginatedProjects(); // Re-paginate locally to avoid full reload flicker
                },
                error: (err) => console.error('Failed to delete project', err)
            });
        }
    }
}
