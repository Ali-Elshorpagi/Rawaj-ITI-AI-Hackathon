import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastr.error('Cannot connect to server. Check your internet connection.', 'Connection Error');
      } else if (error.status >= 500) {
        toastr.error(error.error?.message ?? 'A server error occurred.', 'Server Error');
      } else if (error.status === 429) {
        toastr.warning('Too many requests. Please wait a moment.', 'Rate Limited');
      }
      return throwError(() => error);
    })
  );
};
