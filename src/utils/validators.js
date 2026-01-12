// utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.name) errors.name = 'Name is required';
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!formData.phone_number) {
    errors.phone_number = 'Phone number is required';
  } else if (!validatePhone(formData.phone_number)) {
    errors.phone_number = 'Phone number must be 10 digits';
  }
  if (!formData.role) errors.role = 'Role is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
export const CounsellorvalidateForm = (formData) => {
  const errors = {};
  
  if (!formData.name) errors.name = 'Name is required';
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
 
  if (!formData.role) errors.role = 'Role is required';

  if (!formData.teamOwnerId) errors.teamOwnerId = 'Team owner is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};