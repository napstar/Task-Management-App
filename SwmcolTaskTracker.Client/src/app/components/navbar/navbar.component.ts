import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: []
})
export class NavbarComponent {
    isTasksMenuOpen = false;

    toggleTasksMenu() {
        this.isTasksMenuOpen = !this.isTasksMenuOpen;
    }

    closeTasksMenu() {
        this.isTasksMenuOpen = false;
    }
}
