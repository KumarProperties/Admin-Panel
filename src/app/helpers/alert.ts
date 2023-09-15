import Swal from 'sweetalert2';

export function alertErrorHandler(response: any) {
  console.debug(`🌿 => alertErrorHandler => response:`, response);
  alertModal('error', response.error.data.error);
}

export function alertModal(type: 'error' | 'success', message: string) {
  Swal.fire({
    position: 'center',
    icon: type,
    title: message,
  });
}

export function alertModalWithoutConfirm(
  type: 'error' | 'success',
  message: string,
  timeout = 1500
) {
  Swal.fire({
    position: 'center',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: timeout,
  });
}
