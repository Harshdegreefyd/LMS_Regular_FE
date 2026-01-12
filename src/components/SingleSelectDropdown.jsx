import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Calendar, X } from 'lucide-react';



// SingleSelect Component
const SingleSelectDropdown = ({
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-w-[200px] shadow-sm cursor-pointer"
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Clear option */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/30">
            <div
              onClick={handleClear}
              className="text-xs text-gray-600 hover:text-red-600 font-medium transition-colors cursor-pointer"
            >
              Clear Selection
            </div>
          </div>
          
          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={`${option}-${index}`}
                onClick={() => handleSelect(option)}
                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                  value === option ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSelectDropdown