import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (message, status = 'info') => {
  switch (status) {
    case 'success':
      toast.success(message || 'Success!');
      break;
    case 'error':
      toast.error(message || 'Something went wrong!');
      break;
    case 'info':
      toast.info(message || 'FYI');
      break;
    case 'warning':
      toast.warn(message || 'Warning!');
      break;
    default:
      toast(message || 'Notification');
  }
};
