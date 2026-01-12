import React, { useState, useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "blue",
  icon: Icon,
  iconColor = "blue",
  size = "xl",
  height = "lg", // New prop for height control
  animationDuration = 300, // Animation duration in ms
  animationDelay = 50, // Delay before animation starts
  loading=false,
loadingText=''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => {
        setIsVisible(true);
      }, animationDelay);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
    }
  }, [isOpen, animationDelay, animationDuration]);

  if (!shouldRender) return null;

  const confirmButtonColors = {
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-300",
    orange: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-300",
    indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300",
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-300",
  };

  const iconColors = {
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    indigo: "text-indigo-600 bg-indigo-100",
    green: "text-green-600 bg-green-100",
  };

  // Width configurations based on size prop
  const sizeClasses = {
    xs: "max-w-xs",      // ~320px
    sm: "max-w-sm",      // ~384px
    md: "max-w-md",      // ~448px
    lg: "max-w-lg",      // ~512px
    xl: "max-w-xl",      // ~576px
    "2xl": "max-w-2xl",  // ~672px
    "3xl": "max-w-3xl",  // ~768px
    "4xl": "max-w-4xl",  // ~896px
    "5xl": "max-w-5xl",  // ~1024px
    "6xl": "max-w-6xl",  // ~1152px
    "7xl": "max-w-7xl",  // ~1280px
    full: "max-w-full",  // 100%
  };

  // Height configurations for fixed height modal
  const heightClasses = {
    xs: "h-64",     // ~256px
    sm: "h-80",     // ~320px
    md: "h-96",     // ~384px
    lg: "h-[540px]", // ~512px
    xl: "h-[40rem]", // ~640px
    "2xl": "h-[48rem]", // ~768px
    "3xl": "h-[66rem]", // ~896px
    full: "h-screen", // 100vh
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 
        transition-all duration-${animationDuration === 300 ? '300' : '500'} ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur effect */}
      <div 
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm
          transition-all duration-${animationDuration === 300 ? '300' : '500'} ease-out
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      ></div>

      {/* Modal Container */}
      <div 
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.xl} ${heightClasses[height] || heightClasses.lg}
          transform transition-all duration-${animationDuration === 300 ? '300' : '500'} ease-out
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
          {/* Modal Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center">
              {Icon && (
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${iconColors[iconColor]} mr-4`}>
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-lg text-sm p-2 transition-colors duration-200 flex-shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-scroll custom-scrollbar">
            <div className="p-6">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </div>

          {/* Modal Footer - Fixed */}
          <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            {cancelText && (
              <button
                onClick={onClose}
                className="text-gray-600 bg-white hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-300 text-sm font-medium px-6 py-3 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {cancelText}
              </button>
            )}
            {confirmText && (
              <button
                onClick={onConfirm}
                className={`
                  text-white ${confirmButtonColors[confirmColor]} focus:ring-4 focus:outline-none 
                  font-medium rounded-lg text-sm px-6 py-3 text-center transition-all duration-200 
                  shadow-sm hover:shadow-md transform hover:scale-105
                `}
              >
               {loading ? loadingText :   confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;