import React, { useState, useEffect, useContext } from 'react';
import { Select, Button, Modal, Typography, Space, Card } from 'antd';
import { CoffeeOutlined, MedicineBoxOutlined, CarOutlined, RestOutlined, PhoneOutlined, EllipsisOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

// Break types with icons and descriptions
const BREAK_TYPES = [
  {
    id: 'lunch',
    label: 'Lunch Break',
    icon: <CoffeeOutlined />,
    description: 'Meal time break',
    duration: '30-60 minutes'
  },

  {
    id: 'personal',
    label: 'Personal Break',
    icon: <CarOutlined />,
    description: 'Personal matters',
    duration: 'Variable'
  },
  {
    id: 'rest',
    label: 'Rest Break',
    icon: <RestOutlined />,
    description: 'Short rest period',
    duration: '15-30 minutes'
  },
  {
    id: 'emergency',
    label: 'Emergency Break',
    icon: <PhoneOutlined />,
    description: 'Urgent matters',
    duration: 'Variable'
  },
  {
    id: 'other',
    label: 'Other',
    icon: <EllipsisOutlined />,
    description: 'Other reasons',
    duration: 'Variable'
  }
];

const CounselorBreakManager = () => {
  const { break_start, break_end, updateBreakStatus, counsellor_id } = useContext(BreakContext);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerActive, setTimerActive] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedBreakType, setSelectedBreakType] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const isOnBreak = break_start && !break_end;

  // Sync popup open state on backend break status changes
  useEffect(() => {
    if (break_end && isPopupOpen) {
      showNotification('Break completed successfully! You are now available for sessions.', 'success');
      setTimeout(() => {
        setIsPopupOpen(false);
        setSelectedBreakType(null); // Reset selection
      }, 2000);
      setTimerActive(false);
      return;
    }

    if (isOnBreak) {
      setIsPopupOpen(true);
      setTimerActive(true);
    } else {
      setTimerActive(false);
      setIsPopupOpen(false);
    }
  }, [break_start, break_end]);

  // Update current time every second to update timer display
  useEffect(() => {
    let interval;

    if (timerActive) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Cross-tab syncing of popup open state using localStorage
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'breakActive') {
        if (e.newValue === 'true') {
          setIsPopupOpen(true);
          setTimerActive(true);
        } else {
          setIsPopupOpen(false);
          setTimerActive(false);
        }
      }
    };

    window.addEventListener('storage', onStorageChange);

    // On mount, sync popup state with localStorage in case break already active
    const breakActive = localStorage.getItem('breakActive') === 'true';
    if (breakActive) {
      setIsPopupOpen(true);
      setTimerActive(true);
    }

    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const getElapsedTime = () => {
    if (!break_start) return '0m 0s';

    const breakStartTime = new Date(break_start);
    const elapsedMs = currentTime - breakStartTime;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${elapsedSeconds}s`;
    }
    return `${mins}m ${elapsedSeconds}s`;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter break types based on search
  const filteredBreakTypes = BREAK_TYPES.filter(type =>
    type.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    type.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleStartBreak = async () => {
    if (!selectedBreakType) {
      showNotification('Please select a break type first.', 'error');
      return;
    }

    setLoading(true);

    try {
      const breakTypeData = BREAK_TYPES.find(type => type.id === selectedBreakType);
      
      const response = await fetch(`${BASE_URL}/counsellor/break/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          break_start: new Date().toISOString(),
          counselor_id: counsellor_id,
          break_type: selectedBreakType,
          break_type_label: breakTypeData.label,
          break_type_description: breakTypeData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        updateBreakStatus({
          break_start: new Date().toISOString(),
          break_end: null,
          break_type: selectedBreakType,
        });

        localStorage.setItem('breakActive', 'true');

        setTimerActive(true);
        showNotification(`${breakTypeData.label} started successfully! You are now unavailable for new sessions.`);
      } else {
        throw new Error('Failed to start break');
      }
    } catch (error) {
      showNotification('Failed to start break. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/counsellor/break/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          break_end: new Date().toISOString(),
          counselor_id: counsellor_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        updateBreakStatus({
          break_start,
          break_end: new Date().toISOString(),
        });

        // Sync localStorage for cross-tab unlock
        localStorage.setItem('breakActive', 'false');

        setTimerActive(false);
        showNotification('Break ended successfully! You are now available for sessions.');
        setIsPopupOpen(false);
        setSelectedBreakType(null); // Reset selection
      } else {
        throw new Error('Failed to end break');
      }
    } catch (error) {
      showNotification('Failed to end break. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openBreakPopup = () => {
    // Only allow opening popup if not currently on break
    if (!isOnBreak) setIsPopupOpen(true);
  };

  const closePopup = () => {
    // Only allow closing popup if not on break and not loading
    if (!loading && !isOnBreak) {
      setIsPopupOpen(false);
      setSelectedBreakType(null); // Reset selection when closing
      setSearchValue(''); // Reset search
    }
  };

  const handleBreakTypeChange = (value) => {
    setSelectedBreakType(value);
  };

  const getCurrentBreakType = () => {
    if (isOnBreak && selectedBreakType) {
      return BREAK_TYPES.find(type => type.id === selectedBreakType);
    }
    return null;
  };

  const currentBreakType = getCurrentBreakType();

  return (
    <div className="p-6">
      <Notification notification={notification} />

      <BreakButton isOnBreak={isOnBreak} getElapsedTime={getElapsedTime} onOpenPopup={openBreakPopup} />

      <Modal
        title={isOnBreak ? "Break in Progress" : "Start Break"}
        open={isPopupOpen}
        onCancel={closePopup}
        closable={!isOnBreak}
        maskClosable={false}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          {isOnBreak ? (
            // Break in progress view
            <div className="text-center">
              {currentBreakType && (
                <Card className="mb-4" size="small">
                  <Space>
                    {currentBreakType.icon}
                    <div>
                      <Text strong>{currentBreakType.label}</Text>
                      <br />
                      <Text type="secondary" size="small">{currentBreakType.description}</Text>
                    </div>
                  </Space>
                </Card>
              )}
              
              <Title level={3}>Break Time: {getElapsedTime()}</Title>
              <Text type="secondary">You are currently unavailable for new sessions</Text>
              
              <div className="mt-6">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleEndBreak}
                  block
                >
                  End Break
                </Button>
              </div>
            </div>
          ) : (
            // Start break view
            <div>
              <div className="mb-4">
                <Text strong>Select Break Type:</Text>
                <Select
                  showSearch
                  placeholder="Search and select break type..."
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedBreakType}
                  onChange={handleBreakTypeChange}
                  onSearch={setSearchValue}
                  searchValue={searchValue}
                  filterOption={false}
                  size="large"
                >
                  {filteredBreakTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      <Space>
                        {type.icon}
                        <div>
                          <div>{type.label}</div>
                          <Text type="secondary" size="small">
                            {type.description} • {type.duration}
                          </Text>
                        </div>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              {selectedBreakType && (
                <Card size="small" className="mb-4">
                  <Space>
                    {BREAK_TYPES.find(t => t.id === selectedBreakType)?.icon}
                    <div>
                      <Text strong>
                        {BREAK_TYPES.find(t => t.id === selectedBreakType)?.label}
                      </Text>
                      <br />
                      <Text type="secondary" size="small">
                        {BREAK_TYPES.find(t => t.id === selectedBreakType)?.description}
                      </Text>
                      <br />
                      <Text type="secondary" size="small">
                        Typical duration: {BREAK_TYPES.find(t => t.id === selectedBreakType)?.duration}
                      </Text>
                    </div>
                  </Space>
                </Card>
              )}

              <div className="space-y-3">
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleStartBreak}
                  disabled={!selectedBreakType}
                  block
                >
                  Start Break
                </Button>
                
                <Button
                  size="large"
                  onClick={closePopup}
                  disabled={loading}
                  block
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CounselorBreakManager;