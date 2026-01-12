import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MultiSelectDropdown = ({
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const selectedValues = Array.isArray(value) ? value : [];

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  const handleSelectAll = () => {
    onChange(filteredOptions);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  };

  // Calculate dynamic height - minimum 5 options visible
  const getDropdownHeight = () => {
    const optionHeight = 48; // py-3 (12px * 2) + text height
    const availableOptions = filteredOptions.length;
    const minOptions = Math.min(5, availableOptions);
    const maxOptions = Math.min(8, availableOptions); // Maximum 8 options before scroll
    const visibleOptions = availableOptions < 5 ? availableOptions : (availableOptions > 8 ? maxOptions : availableOptions);
    return visibleOptions > 0 ? `${visibleOptions * optionHeight}px` : '48px';
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-w-[200px] shadow-sm cursor-pointer"
      >
        <span className={selectedValues.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {getDisplayText()}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[280px] overflow-hidden">
          {/* Search Input */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Actions Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors duration-200 focus:outline-none"
                >
                  Clear All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 focus:outline-none"
                >
                  Select All Filtered
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {selectedValues.length} of {options.length} selected
              </span>
            </div>
          </div>

          {/* Options List */}
          <div 
            className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
            style={{ height: getDropdownHeight() }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? `No options found for "${searchTerm}"` : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div
                    key={`${option}-${index}`}
                    onClick={() => handleSelect(option)}
                    className={`flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-blue-50 border-r-3 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center w-full">
                      <div className="relative mr-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 pointer-events-none"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm transition-colors duration-200 ${
                        isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown