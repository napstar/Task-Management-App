import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './main-layout.component.html',
    styles: []
})
export class MainLayoutComponent implements OnInit {
    isTasksMenuOpen = true; // Default open for visibility/convenience
    isProjectsMenuOpen = true;

    userName: string = 'User';
    userEmail: string = '';
    userInitials: string = 'U';

    private authService = inject(MsalService);

    ngOnInit(): void {
        const account = this.authService.instance.getActiveAccount();
        if (account) {
            this.userName = account.name || 'User';
            this.userEmail = account.username || '';
            this.userInitials = this.userName.charAt(0).toUpperCase();
        }
    }

    toggleTasksMenu() {
        this.isTasksMenuOpen = !this.isTasksMenuOpen;
    }

    toggleProjectsMenu() {
        this.isProjectsMenuOpen = !this.isProjectsMenuOpen;
    }

    logout() {
        this.authService.logoutRedirect();
    }
}
