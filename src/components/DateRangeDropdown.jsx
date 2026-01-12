import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const DateRangeDropdown = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  label = "Select Date Range"
}) => {
  // Convert string dates to dayjs objects for Ant Design
  const startDate = startValue && startValue.trim() ? dayjs(startValue, 'YYYY-MM-DD') : null;
  const endDate = endValue && endValue.trim() ? dayjs(endValue, 'YYYY-MM-DD') : null;

  // Handle individual date changes
  const handleStartChange = (date) => {
    const newStartDate = date ? date.format('YYYY-MM-DD') : '';
    onStartChange(newStartDate);
    
    // If there's an end date selected and it's before the new start date, clear it
    if (date && endDate && endDate.isBefore(date, 'day')) {
      onEndChange('');
    }
  };

  const handleEndChange = (date) => {
    onEndChange(date ? date.format('YYYY-MM-DD') : '');
  };

  // Disable dates before start date for end date picker
  const disableEndDate = (current) => {
    if (!startDate) return false; // If no start date, allow any end date
    return current && current.isBefore(startDate, 'day');
  };

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <div className='flex gap-2'>
        <style jsx global>{`
        .custom-date-picker .ant-picker-input > input::placeholder {
          font-weight: bold !important;
          color: #6b7280;
        }
      `}</style>
        
        <DatePicker
          value={startDate}
          onChange={handleStartChange}
          placeholder="Start Date"
          allowClear={true}
          className="custom-date-picker hover:border-gray-600 focus:border-black"
          style={{
            width: '50%',
            height: '42px',
            borderRadius: '12px',
            border: '2px solid #D1D5DB',
            // boxShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease'
          }}
        />
        <DatePicker
          value={endDate}
          onChange={handleEndChange}
          placeholder="End Date"
          allowClear={true}
          disabledDate={disableEndDate}
          className="custom-date-picker hover:border-gray-600 focus:border-black"
          style={{
            width: '50%',
            height: '42px',
            borderRadius: '12px',
            border: '2px solid #D1D5DB',
            // boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease'
          }}
        />
      </div>
    </div>
  );
};

export default DateRangeDropdown;