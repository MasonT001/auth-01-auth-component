import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, resolveForwardRef } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({providedIn: 'root'})
export class AuthService { 
    user = new BehaviorSubject<User>(null)

    constructor(private http: HttpClient, private router: Router) { }
    signUp(email: string, password: string) {
         return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD1y7zvHkYjDmtNA0jDoCRdk3Wt1C_-c_A',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        }))
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD1y7zvHkYjDmtNA0jDoCRdk3Wt1C_-c_A', 
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        }));
    }

    autoLogin() {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'))
        if (!userData) {
            return;
        }
        const loadedUser = new User(userData.email, userData.id, userData._token, new Date (userData._tokenExpirationDate))

        if (loadedUser.token) {
            this.user.next(loadedUser);
        }

    }

    logout() {
        this.user.next(null)
        this.router.navigate(['/auth'])
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
            const user = new User(email, userId, token, expirationDate)
            this.user.next(user)
            localStorage.setItem('userData', JSON.stringify(user))
    }

    private handleError(errorRes: HttpErrorResponse) { 
        let errorMessage = 'An unknown error occurred!'
            if (!errorRes.error || !errorRes.error.error) {
                return throwError(errorMessage)
            }
            switch (errorRes.error.error.message) {
                case 'EMAIL EXISTS': 
                  errorMessage = 'This email is already in use!'
                  break
                case 'EMAIL NOT FOUND':
                    errorMessage = 'This email address does not exist'
                    break
                case 'INVALID PASSWORD': 
                    errorMessage = 'Password was not correct'    
              }
              return throwError(errorMessage)
    }
}