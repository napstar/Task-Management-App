import { Component, inject, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent implements OnInit {
  private authService = inject(MsalService);
  private router = inject(Router);

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.instance.getActiveAccount() || this.authService.instance.getAllAccounts().length > 0) {
      if (!this.authService.instance.getActiveAccount()) {
        this.authService.instance.setActiveAccount(this.authService.instance.getAllAccounts()[0]);
      }
      this.router.navigate(['/dashboard']);
    }

    // Subscribe to login success event (if handling redirect via AppComponent)
    this.authService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult | null) => {
        if (result) {
          this.authService.instance.setActiveAccount(result.account);
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  login() {
    this.authService.loginRedirect();
  }
}
