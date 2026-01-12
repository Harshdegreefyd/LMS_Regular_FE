import React from "react";
import { Eye, EyeOff, Key, User } from "react-feather";
import Modal from "../../common/Modal";

const ChangePasswordModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  toggleShowPassword,
  handleKeyDown
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Change Password"
      confirmText="Update Password"
      icon={Key}
      iconColor="blue"
    >
      <div className="space-y-5">
        {/* User Info Section */}
        <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Changing password for</p>
            <p className="text-sm text-gray-900 font-semibold">{user?.counsellor_name}</p>
          </div>
        </div>

        {/* Password Fields */}
        <div className="space-y-4">
          {['New Password', 'Confirm Password'].map((label, index) => (
            <div key={label} className="group">
              <label 
                htmlFor={label.toLowerCase().replace(' ', '-')}
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {label}
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  id={label.toLowerCase().replace(' ', '-')}
                  value={index === 0 ? newPassword : confirmPassword}
                  onChange={index === 0 ? 
                    (e) => setNewPassword(e.target.value) : 
                    (e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full rounded-md border-gray-300 py-2.5 px-3 pr-10 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {index === 0 && newPassword.length > 0 && (
                <p className={`text-xs mt-1 ${
                  newPassword.length < 6 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {newPassword.length < 6 
                    ? 'Password must be at least 6 characters' 
                    : 'Password strength: Good'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">PASSWORD REQUIREMENTS</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              Minimum 6 characters
            </li>
            <li className="flex items-center">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                newPassword === confirmPassword && confirmPassword.length > 0 ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              Passwords must match
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;