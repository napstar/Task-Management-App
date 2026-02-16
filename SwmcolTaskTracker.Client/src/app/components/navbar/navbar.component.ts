import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: []
})
export class NavbarComponent {
    private authService = inject(MsalService);
    private userService = inject(UserService);

    isTasksMenuOpen = false;
    isProjectsMenuOpen = false;

    get currentUser() {
        return this.userService.getCurrentUser();
    }

    login() {
        this.authService.loginRedirect();
    }

    logout() {
        this.authService.logoutRedirect();
    }

    toggleTasksMenu() {
        this.isTasksMenuOpen = !this.isTasksMenuOpen;
        this.isProjectsMenuOpen = false; // Close other menu
    }

    closeTasksMenu() {
        this.isTasksMenuOpen = false;
    }

    toggleProjectsMenu() {
        this.isProjectsMenuOpen = !this.isProjectsMenuOpen;
        this.isTasksMenuOpen = false; // Close other menu
    }

    closeProjectsMenu() {
        this.isProjectsMenuOpen = false;
    }
}

