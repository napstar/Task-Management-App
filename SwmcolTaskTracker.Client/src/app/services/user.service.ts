import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

export interface GraphUser {
    id: string;
    displayName: string;
    mail: string; // Often null for guest users
    userPrincipalName: string; // The email-like ID
}

interface GraphResponse {
    value: GraphUser[];
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private authService = inject(MsalService);
    private graphUrl = 'https://graph.microsoft.com/v1.0/users';

    getCurrentUser() {
        return this.authService.instance.getActiveAccount();
    }

    searchUsers(query: string): Observable<GraphUser[]> {
        // Filter by displayName starts with query
        // Selecting only needed fields to keep payload small
        const url = `${this.graphUrl}?$filter=startswith(displayName,'${query}')&$select=id,displayName,mail,userPrincipalName&$top=10`;

        return this.http.get<GraphResponse>(url).pipe(
            map(response => response.value)
        );
    }
}
