import React from 'react';
import {
  Pagination as AntPagination,
  Select,
  Space,
  Typography,
  theme,
  Grid
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined
} from '@ant-design/icons';

const { useToken } = theme;
const { Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const Pagination = ({ 
  totalPages, 
  handlePageChange, 
  currentPage, 
  leadsPerPage, 
  totalLeads, 
  onLimitChange 
}) => {
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const startItem = ((currentPage - 1) * leadsPerPage) + 1;
  const endItem = Math.min(currentPage * leadsPerPage, totalLeads);

  const limitOptions = [10, 25, 50, 100];

  const handleLimitChange = (value) => {
    onLimitChange(value);
  };

  // Custom item renderer for better control
  const itemRender = (page, type, originalElement) => {
    if (type === 'prev') {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: currentPage === 1 ? token.colorTextDisabled : token.colorPrimary,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}>
          {isMobile ? 'Prev' : <LeftOutlined />}
        </div>
      );
    }
    if (type === 'next') {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: currentPage === totalPages ? token.colorTextDisabled : token.colorPrimary,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}>
          {isMobile ? 'Next' : <RightOutlined />}
        </div>
      );
    }
    if (type === 'jump-prev' || type === 'jump-next') {
      return <span style={{ color: token.colorTextSecondary }}>•••</span>;
    }
    return originalElement;
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'white',
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      padding: `${token.padding}px ${token.paddingLG}px`,
    }}>
      {/* Desktop View */}
      <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size="middle">
          <Text type="secondary" style={{ fontSize: 14 }}>
            Showing <Text strong>{startItem}</Text> to <Text strong>{endItem}</Text> of{' '}
            <Text strong>{totalLeads}</Text> results
          </Text>
          
          <Space size="small">
            <Text type="secondary" style={{ fontSize: 14 }}>Show:</Text>
            <Select
              value={leadsPerPage}
              onChange={handleLimitChange}
              size="small"
              style={{ width: 80 }}
              bordered
              dropdownStyle={{ borderRadius: token.borderRadius }}
            >
              {limitOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            <Text type="secondary" style={{ fontSize: 14 }}>entries</Text>
          </Space>
        </Space>

        <AntPagination
          current={currentPage}
          total={totalLeads}
          pageSize={leadsPerPage}
          onChange={handlePageChange}
          itemRender={itemRender}
          showSizeChanger={false}
          showQuickJumper={false}
          showTotal={false}
          size="default"
        />
      </div>

      {/* Mobile View */}
      <div style={{ display: isMobile ? 'flex' : 'none', flexDirection: 'column', gap: token.margin }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Page {currentPage} of {totalPages}
          </Text>
          
          <Space size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>Show:</Text>
            <Select
              value={leadsPerPage}
              onChange={handleLimitChange}
              size="small"
              style={{ width: 70 }}
              bordered
              dropdownStyle={{ borderRadius: token.borderRadius }}
            >
              {limitOptions.map(option => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Space>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {startItem}-{endItem} of {totalLeads}
          </Text>

          <Space>
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '4px 12px',
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                backgroundColor: 'white',
                color: currentPage === 1 ? token.colorTextDisabled : token.colorText,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              Previous
            </button>
            
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '4px 12px',
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                backgroundColor: 'white',
                color: currentPage === totalPages ? token.colorTextDisabled : token.colorText,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 12
              }}
            >
              Next
            </button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Pagination;