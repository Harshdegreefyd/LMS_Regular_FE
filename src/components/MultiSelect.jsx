import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const truncateText = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  className = "",
  onStateChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Normalize options to handle both string arrays and object arrays
  const normalizeOptions = (opts) => {
    if (!opts || !Array.isArray(opts)) return [];
    return opts.map(opt => {
      if (typeof opt === 'string') {
        return { _id: opt, name: opt };
      }
      // Handle objects with different id fields
      return {
        _id: opt.counsellor_id || opt.id || opt.value || opt.name,
        name: opt.counsellor_name || opt.label || opt.title || opt._id || opt.id || opt.value
      };
    });
  };

  // Normalize value to handle both string arrays and object arrays
  const normalizeValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val.map(v => {
      if (typeof v === 'string') {
        return { _id: v, name: v };
      }
      return {
        _id: v._id || v.id || v.value || v.name,
        name: v.name || v.label || v.title || v._id || v.id || v.value
      };
    });
  };

  const normalizedOptions = normalizeOptions(options);
  const normalizedValue = normalizeValue(value);

  // Filter options by name
  const filteredOptions = normalizedOptions.filter(
    (opt) => opt?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const displayValue = Array.isArray(normalizedValue) ? normalizedValue : [];

  const handleSelect = (option) => {

    if (disabled) return;

    const newValue = [...displayValue].filter(v => v.name !== 'Any');
    
    if (option.name === 'Any') {
      // Return the original format based on the input
      const result = typeof value?.[0] === 'string' ? ['Any'] : [{ _id: 'Any', name: 'Any' }];
      onChange?.(result);
      onStateChange?.(result);
    } else {
      const alreadySelected = newValue.some(v => v._id === option._id);
      const updatedValue = alreadySelected
        ? newValue.filter(v => v._id !== option._id)
        : [...newValue, option];

      // Return the original format based on the input
      const result = typeof value?.[0] === 'string' 
        ? updatedValue.map(v => v._id)
        : updatedValue.map(v => {
            // Preserve original object structure if it was an object
            const originalOption = options.find(opt => 
              (typeof opt === 'object' && (opt._id === v._id || opt.id === v._id || opt.value === v._id))
            );
            return originalOption || { _id: v._id, name: v.name };
          });
      onChange?.(result);
      onStateChange?.(result);
    }
  };

  const handleRemove = (itemToRemove) => {
    if (disabled) return;

    const newValue = displayValue.filter(v => v._id !== itemToRemove._id);
    
    // Return the original format based on the input
    const result = typeof value?.[0] === 'string' 
      ? newValue.map(v => v.name)
      : newValue.map(v => {
          const originalOption = options.find(opt => 
            (typeof opt === 'object' && (opt._id === v._id || opt.id === v._id || opt.value === v._id))
          );
          return originalOption || { _id: v._id, name: v.name };
        });
        
    onChange?.(result);
    onStateChange?.(result);
  };

  const getDisplayText = () => {
    if (displayValue.length === 0) return placeholder;
    if (displayValue.length === 1 && displayValue[0]?.name === 'Any') return 'Any';
    // if (displayValue.length === 1) return truncateText(displayValue[0]?.name, 25);
    if (displayValue.length <= 0) {
      return displayValue.map(v => truncateText(v?.name, 15)).join(', ');
    }
    return `${displayValue.length} items selected`;
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full px-3 text-nowrap py-2 border-2  rounded-md cursor-pointer min-h-[38px] flex items-center justify-between bg-white shadow-2xl ${
          disabled 
            ? 'bg-gray-50 cursor-not-allowed text-nowrap' 
            : 'hover:border-gray-400 text-nowrap '
        }`}
        onClick={toggleDropdown}
      >
        <span className={`truncate ${displayValue.length === 0 ? 'text-gray-400 text-nowrap font-semibold' : 'text-gray-900 text-nowrap font-semibold'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown
          size={16}
          className={` text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = displayValue.some(v => v._id === option._id);
                return (
                  <div
                    key={option._id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="truncate" title={option.name}>{option.name}</span>
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {displayValue.length > 1 && displayValue[0]?.name !== 'Any' && (
            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <div className="text-xs text-gray-600 mb-1">Selected ({displayValue.length}):</div>
              <div className="flex flex-wrap gap-1">
                {displayValue.slice(0, 5).map(val => (
                  <span key={val._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {truncateText(val.name, 12)}
                    <X
                      size={10}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(val);
                      }}
                    />
                  </span>
                ))}
                {displayValue.length > 5 && (
                  <span className="text-xs text-gray-500">+{displayValue.length - 5} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isOpen && !disabled && (
        <div className="fixed inset-0 z-5" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default MultiSelect;