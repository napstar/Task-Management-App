import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './main-layout.component.html',
    styles: []
})
export class MainLayoutComponent {
    isTasksMenuOpen = true; // Default open for visibility/convenience

    toggleTasksMenu() {
        this.isTasksMenuOpen = !this.isTasksMenuOpen;
    }
}
