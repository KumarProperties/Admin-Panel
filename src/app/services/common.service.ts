import Swal from 'sweetalert2';

import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private jwtHelper = new JwtHelperService();
  queryString = window.location.search;
  queryParams!: { [key: string]: any } | any;

  constructor(private route: Router) {}

  public getSearchParams() {
    if (!this.queryParams) {
      const urlParams = new URLSearchParams(this.queryString) as any;
      this.queryParams = {};

      for (const [key, value] of urlParams) {
        this.queryParams[key] = value;
      }
    }

    return this.queryParams;
  }

  public confirm(action: 'Delete', data: string): Promise<boolean> {
    return new Promise((res) => {
      Swal.fire({
        title: `Do you want to ${action} ?`,
        text: data,
        showCancelButton: true,
        confirmButtonText: action,
        denyButtonText: `Cancel`,
      }).then((response) => res(response.isConfirmed));
    });
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  public logout() {
    localStorage.removeItem('token');
    this.route.navigate(['/']);
  }
}
