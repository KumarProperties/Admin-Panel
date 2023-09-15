import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class IndexInterceptor implements HttpInterceptor {
  host = environment.host;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get the existing headers
    let { headers } = request,
      modifiedHeaders;
    // Append additional headers

    if (!headers.has('no-intercept')) {
      modifiedHeaders = headers
        .append('Authorization', 'Bearer ' + localStorage.getItem('token'))
        .append('Content-Type', 'application/json');
    } else {
      modifiedHeaders = headers
        .append('Authorization', 'Bearer ' + localStorage.getItem('token'))
        .delete('No-Intercept');
    }

    // Clone the original request and set the modified headers
    const clonedRequest = request.clone({
      url: this.host + request.url,
      headers: modifiedHeaders,
    });

    // Pass the cloned request to the next interceptor or the HTTP handler
    return next.handle(clonedRequest);
  }
}
