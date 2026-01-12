import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Select,
  DatePicker,
  Drawer,
  Badge,
  Card,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  ConfigProvider,
  theme,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock filter options - replace with your actual import
const filterOptions = {
  mode: ['Online', 'Offline', 'Hybrid'],
  source: ['Website', 'Facebook', 'Google', 'Instagram', 'LinkedIn', 'Referral', 'Direct', 'WhatsApp', 'Email'],
  lead_status: ['Pre Application', 'Application', 'Admission', 'Not Interested', 'Fresh', 'Follow Up', 'Converted'],
  sub_lead_status: [
    'Untouched Lead',
    'Counselling Yet to be Done',
    'Initial Counseling Completed',
    'Ready to Pay',
    'Form Filled_Degreefyd',
    'Form Filled_Partner website',
    'Walkin Completed',
    'Registration Done',
    'Semester Paid',
    'Multiple Attempts made',
    'Invalid number / Wrong Number',
    'Language Barrier',
    'Not Enquired',
    'Already Enrolled_Partner',
    'First call Not Interested',
    'Not Eligible',
    'Dublicate_Same student exists',
    'Only_Regular course',
    'Next Year',
    'Budget issue',
    'Already Enrolled_NP',
    'Reason not shared',
    'Location issue'
  ],
  calling_status: ['Called', 'Not Called', 'Busy', 'No Answer', 'Invalid Number', 'Callback Scheduled', 'Answered'],
  calling_sub_status: ['Hot', 'Warm', 'Cold', 'Not Interested', 'Callback Required', 'Follow-up Needed', 'Converted'],
  campaign_name: ['Campaign A', 'Campaign B', 'Campaign C', 'Holiday Sale', 'Spring Promo', 'Summer Sale', 'Black Friday']
};

// Hook for handling click outside (maintaining original functionality)
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// Enhanced Search Bar Component
const SearchBar = ({ value, onChange, onSearch, loading }) => (
  <div style={{ marginBottom: 20 }}>
    <Input.Search
      placeholder="Search by name, email, phone or lead ID..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSearch={onSearch}
      enterButton={
        <Button
          type="primary"
          icon={loading ? <ReloadOutlined spin /> : <SearchOutlined />}
          loading={loading}
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            borderRadius: '0 8px 8px 0',
            height: 48
          }}
        >
          Search
        </Button>
      }
      size="large"
      style={{
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e8e8e8'
      }}
    />
  </div>
);

// Filter Item Component
const FilterItem = ({ label, children, required = false }) => (
  <div style={{ marginBottom: 16 }}>
    <Text 
      strong 
      style={{ 
        display: 'block', 
        marginBottom: 6, 
        color: '#1f2937',
        fontSize: '13px',
        fontWeight: 600
      }}
    >
      {label} {required && <span style={{ color: '#ff4d4f' }}>*</span>}
    </Text>
    {children}
  </div>
);

// Active Filters Display Component
const ActiveFilters = ({ filters, onClear, onRemoveFilter }) => {
  const getActiveFilters = () => {
    const active = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        if (key === 'searchTerm') return; // Skip search term from active filters
        
        if (key === 'createdAt_start' && filters.createdAt_end) {
          active.push({
            key: 'dateRange',
            label: 'Date Range',
            value: `${dayjs(value).format('MMM DD')} - ${dayjs(filters.createdAt_end).format('MMM DD')}`
          });
        } else if (key === 'createdAt_end') {
          return; // Skip as it's handled with start date
        } else if (Array.isArray(value)) {
          active.push({
            key,
            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: `${value.length} selected`
          });
        } else {
          active.push({
            key,
            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: String(value)
          });
        }
      }
    });
    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) return null;

  return (
    <Card 
      style={{ 
        marginBottom: 20,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
        border: '1px solid #e8f4f8'
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text strong style={{ color: '#1f2937', fontSize: '14px' }}>
          Active Filters ({activeFilters.length})
        </Text>
        <Button 
          type="text" 
          size="small" 
          onClick={onClear}
          icon={<ClearOutlined />}
          style={{ 
            color: '#ff4d4f',
            fontSize: '12px',
            height: 'auto',
            padding: '4px 8px'
          }}
        >
          Clear All
        </Button>
      </div>
      <Space size={[8, 8]} wrap>
        {activeFilters.map((filter) => (
          <Tag
            key={filter.key}
            closable
            onClose={() => onRemoveFilter(filter.key)}
            color="blue"
            style={{ 
              margin: '2px',
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: '12px',
              border: '1px solid #1890ff20'
            }}
            closeIcon={<CloseOutlined style={{ fontSize: '10px' }} />}
          >
            <strong>{filter.label}:</strong> {filter.value}
          </Tag>
        ))}
      </Space>
    </Card>
  );
};

// Desktop Filters Component
const DesktopFilters = ({ filters, onFilterChange, filterOptions }) => (
  <Card 
    style={{ 
      marginBottom: 20, 
      borderRadius: 12, 
      boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
      border: '1px solid #e8e8e8'
    }}
    bodyStyle={{ padding: '24px' }}
  >
    <Row gutter={[16, 20]}>
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Added On Date Range">
          <RangePicker
            style={{ width: '100%', borderRadius: 8 }}
            value={filters.createdAt_start && filters.createdAt_end ? [
              dayjs(filters.createdAt_start),
              dayjs(filters.createdAt_end)
            ] : null}
            onChange={(dates) => {
              onFilterChange('createdAt_start', dates ? dates[0].format('YYYY-MM-DD') : '');
              onFilterChange('createdAt_end', dates ? dates[1].format('YYYY-MM-DD') : '');
            }}
            placeholder={['Start Date', 'End Date']}
            suffixIcon={<CalendarOutlined />}
            size="middle"
          />
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Mode">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Mode"
            value={filters.mode || []}
            onChange={(value) => onFilterChange('mode', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.mode.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Source">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Source"
            value={filters.source || []}
            onChange={(value) => onFilterChange('source', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.source.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Lead Status">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Lead Status"
            value={filters.lead_status || []}
            onChange={(value) => onFilterChange('lead_status', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.lead_status.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Lead Sub Status">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Lead Sub Status"
            value={filters.sub_lead_status || []}
            onChange={(value) => onFilterChange('sub_lead_status', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.sub_lead_status.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Connection Status">
          <Select
            style={{ width: '100%' }}
            placeholder="Select Connection Status"
            value={filters.isconnectedyet || undefined}
            onChange={(value) => onFilterChange('isconnectedyet', value)}
            allowClear
            size="middle"
          >
            <Option value="Connected">Connected</Option>
            <Option value="Not Connected">Not Connected</Option>
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Calling Status">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Calling Status"
            value={filters.calling_status || []}
            onChange={(value) => onFilterChange('calling_status', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.calling_status.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Sub Calling Status">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Sub Calling Status"
            value={filters.calling_sub_status || []}
            onChange={(value) => onFilterChange('calling_sub_status', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.calling_sub_status.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Unread Messages">
          <Select
            style={{ width: '100%' }}
            placeholder="Select Unread Messages"
            value={filters.number_of_unread_messages || undefined}
            onChange={(value) => onFilterChange('number_of_unread_messages', value)}
            allowClear
            size="middle"
          >
            <Option value="true">Has Unread Messages</Option>
            <Option value="false">No Unread Messages</Option>
          </Select>
        </FilterItem>
      </Col>
      
      <Col xs={24} sm={12} lg={8} xl={6}>
        <FilterItem label="Campaign Name">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Campaign Name"
            value={filters.campaign_name || []}
            onChange={(value) => onFilterChange('campaign_name', value)}
            showSearch
            size="middle"
            maxTagCount={2}
            maxTagTextLength={10}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filterOptions.campaign_name.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FilterItem>
      </Col>
    </Row>
  </Card>
);

// Mobile Filter Drawer Component
const MobileFilterDrawer = ({ visible, onClose, filters, onFilterChange, filterOptions, onApply, onClear }) => (
  <Drawer
    title={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text strong style={{ fontSize: '16px' }}>Filters</Text>
        <Button 
          type="text" 
          onClick={onClear} 
          icon={<ClearOutlined />}
          style={{ color: '#ff4d4f' }}
        >
          Clear All
        </Button>
      </div>
    }
    placement="bottom"
    height="85vh"
    onClose={onClose}
    open={visible}
    footer={
      <div style={{ 
        padding: '16px 24px',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Row gutter={12}>
          <Col span={12}>
            <Button onClick={onClose} size="large" block>
              Cancel
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type="primary" 
              onClick={onApply} 
              size="large" 
              block
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none'
              }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </div>
    }
  >
    <div style={{ paddingBottom: 80 }}>
      <FilterItem label="Added On Date Range">
        <RangePicker
          style={{ width: '100%' }}
          value={filters.createdAt_start && filters.createdAt_end ? [
            dayjs(filters.createdAt_start),
            dayjs(filters.createdAt_end)
          ] : null}
          onChange={(dates) => {
            onFilterChange('createdAt_start', dates ? dates[0].format('YYYY-MM-DD') : '');
            onFilterChange('createdAt_end', dates ? dates[1].format('YYYY-MM-DD') : '');
          }}
          placeholder={['Start Date', 'End Date']}
          suffixIcon={<CalendarOutlined />}
          size="large"
        />
      </FilterItem>
      
      <FilterItem label="Mode">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Mode"
          value={filters.mode || []}
          onChange={(value) => onFilterChange('mode', value)}
          showSearch
          size="large"
        >
          {filterOptions.mode.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Source">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Source"
          value={filters.source || []}
          onChange={(value) => onFilterChange('source', value)}
          showSearch
          size="large"
        >
          {filterOptions.source.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Lead Status">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Lead Status"
          value={filters.lead_status || []}
          onChange={(value) => onFilterChange('lead_status', value)}
          showSearch
          size="large"
        >
          {filterOptions.lead_status.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Lead Sub Status">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Lead Sub Status"
          value={filters.sub_lead_status || []}
          onChange={(value) => onFilterChange('sub_lead_status', value)}
          showSearch
          size="large"
        >
          {filterOptions.sub_lead_status.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Connection Status">
        <Select
          style={{ width: '100%' }}
          placeholder="Select Connection Status"
          value={filters.isconnectedyet || undefined}
          onChange={(value) => onFilterChange('isconnectedyet', value)}
          allowClear
          size="large"
        >
          <Option value="Connected">Connected</Option>
          <Option value="Not Connected">Not Connected</Option>
        </Select>
      </FilterItem>
      
      <FilterItem label="Calling Status">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Calling Status"
          value={filters.calling_status || []}
          onChange={(value) => onFilterChange('calling_status', value)}
          showSearch
          size="large"
        >
          {filterOptions.calling_status.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Sub Calling Status">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Sub Calling Status"
          value={filters.calling_sub_status || []}
          onChange={(value) => onFilterChange('calling_sub_status', value)}
          showSearch
          size="large"
        >
          {filterOptions.calling_sub_status.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
      
      <FilterItem label="Unread Messages">
        <Select
          style={{ width: '100%' }}
          placeholder="Select Unread Messages"
          value={filters.number_of_unread_messages || undefined}
          onChange={(value) => onFilterChange('number_of_unread_messages', value)}
          allowClear
          size="large"
        >
          <Option value="true">Has Unread Messages</Option>
          <Option value="false">No Unread Messages</Option>
        </Select>
      </FilterItem>
      
      <FilterItem label="Campaign Name">
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select Campaign Name"
          value={filters.campaign_name || []}
          onChange={(value) => onFilterChange('campaign_name', value)}
          showSearch
          size="large"
        >
          {filterOptions.campaign_name.map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      </FilterItem>
    </div>
  </Drawer>
);

// Main Enhanced Filters Component
const EnhancedFilters = ({
  filters: initialFilters = {},
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  loading = false
}) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync with parent filters (maintaining original functionality)
  useEffect(() => {
    setLocalFilters(initialFilters);
    setSearchTerm(initialFilters.searchTerm || '');
  }, [initialFilters]);

  // Handle local filter changes (same as original)
  const handleLocalFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFilterChange?.(key, value);
  };

  // Handle search (same as original)
  const handleSearch = () => {
    const updatedFilters = { ...localFilters, searchTerm };
    setLocalFilters(updatedFilters);
    onApplyFilters?.(updatedFilters);
  };

  // Handle clear filters (same as original)
  const handleClearFilters = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = key === 'sortBy' ? 'createdAt' : key === 'sortOrder' ? 'desc' : '';
      return acc;
    }, {});
    setLocalFilters(clearedFilters);
    setSearchTerm('');
    onClearFilters?.();
  };

  // Handle remove single filter
  const handleRemoveFilter = (key) => {
    if (key === 'dateRange') {
      handleLocalFilterChange('createdAt_start', '');
      handleLocalFilterChange('createdAt_end', '');
    } else {
      handleLocalFilterChange(key, Array.isArray(localFilters[key]) ? [] : '');
    }
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === 'searchTerm') return;
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        count++;
      }
    });
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <div style={{ 
        padding: isMobile ? '16px' : '24px',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
        minHeight: '100vh'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={2} style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: isMobile ? '24px' : '32px'
            }}>
              Advanced Lead Filters
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', marginTop: 8 }}>
              Search and filter your leads with powerful filtering options
            </Text>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            loading={loading}
          />

          {/* Mobile Filter Button */}
          {isMobile && (
            <div style={{ marginBottom: 16 }}>
              <Badge count={activeFilterCount} offset={[10, 0]}>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  size="large"
                  style={{ 
                    width: '100%', 
                    borderRadius: 12,
                    height: 48,
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none'
                  }}
                >
                  Open Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </Badge>
            </div>
          )}

          {/* Active Filters */}
          <ActiveFilters
            filters={localFilters}
            onClear={handleClearFilters}
            onRemoveFilter={handleRemoveFilter}
          />

          {/* Desktop Filters */}
          {!isMobile && (
            <>
              <DesktopFilters
                filters={localFilters}
                onFilterChange={handleLocalFilterChange}
                filterOptions={filterOptions}
              />
              
              {/* Action Buttons */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => onApplyFilters?.(localFilters)}
                    loading={loading}
                    icon={loading ? <ReloadOutlined spin /> : <SearchOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: 'none',
                      borderRadius: 12,
                      height: 48,
                      padding: '0 32px',
                      fontWeight: 600
                    }}
                  >
                    Apply Filters
                  </Button>
                  
                  <Button
                    size="large"
                    onClick={handleClearFilters}
                    icon={<ClearOutlined />}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      padding: '0 32px',
                      fontWeight: 600
                    }}
                  >
                    Clear All
                  </Button>
                </Space>
              </div>
            </>
          )}

          {/* Mobile Filter Drawer */}
          <MobileFilterDrawer
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            filters={localFilters}
            onFilterChange={handleLocalFilterChange}
            filterOptions={filterOptions}
            onApply={() => {
              onApplyFilters?.(localFilters);
              setDrawerVisible(false);
            }}
            onClear={handleClearFilters}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default EnhancedFilters;