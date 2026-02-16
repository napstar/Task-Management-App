import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRoleAssignment } from '../models/user.models';
import { MsalService } from '@azure/msal-angular';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private msalService = inject(MsalService);
    private apiUrl = 'api/users'; // Base API URL

    /**
     * Retrieves the currently logged-in user account from MSAL.
     */
    getCurrentUser() {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
            return accounts[0];
        }
        return null;
    }

    /**
     * Retrieves the role names for a specific user based on their AD OID.
     * Useful for permission checks (e.g. roles.includes('Admin')).
     * @param oid The Azure AD Object ID of the user
     * @returns An Observable of string array containing role names
     */
    getUserRoles(oid: string): Observable<string[]> {
        return this.http.get<UserRoleAssignment[]>(`${this.apiUrl}/${oid}/roles`).pipe(
            map(assignments => assignments.map(a => a.roleName || ''))
        );
    }
}

