// components/Tooltip.js
import React, { useState } from 'react';

const Tooltip = ({ children, text, className = "" }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!text) return <div className={className}>{children}</div>;

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 max-w-xs">
                    {text}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};

export default Tooltip;