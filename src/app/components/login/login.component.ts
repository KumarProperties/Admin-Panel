import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  alertErrorHandler,
  alertModalWithoutConfirm,
} from 'src/app/helpers/alert';
import { BackendService } from 'src/app/services/api/backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(private backend: BackendService, private router: Router) {}

  submit() {
    this.backend.login(this.loginForm.value as any).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.data.token);
        alertModalWithoutConfirm('success', 'Logged In Successfully!');
        this.router.navigate(['dashboard']);
      },
      error: alertErrorHandler,
      complete: () => {
        setTimeout(() => {
          this.loginForm.reset();
        }, 1000);
      },
    });
  }
}
