import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRoleAssignment } from '../models/user.models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = 'api/users'; // Base API URL, typically configured in environment

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
