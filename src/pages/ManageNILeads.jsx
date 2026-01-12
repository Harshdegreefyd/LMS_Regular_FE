import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  Button,
  Tag,
  DatePicker,
  Select,
  Divider,
  Statistic,
  Alert,
  message,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
  Modal,
  Switch
} from "antd";
import {
  ArrowRightOutlined,
  SaveOutlined,
  UserOutlined,
  NumberOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  EditOutlined,
  CloseOutlined,
  PoweroffOutlined,
  PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BASE_URL } from "../config/api";
import { fetchAllCounsellors } from "../network/counsellor";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageNILeads = () => {
  const [currentRule, setCurrentRule] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [counsellorRules, setCounsellorRules] = useState([
    { assignedCounsellor: "", limit: 1 }
  ]);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'month')]);
  const [ruleStatus, setRuleStatus] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const loadCounsellors = async () => {
    setLoadingCounsellors(true);
    try {
      const data = await fetchAllCounsellors();
      setCounsellors(data || []);
    } catch (error) {
      message.error("Failed to load counsellors");
    } finally {
      setLoadingCounsellors(false);
    }
  };

  const fetchCurrentRule = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student-reassignment-logic`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setCurrentRule(data.data);
        setIsEditMode(true);
        
        // Populate form with existing data
        if (data.data.assignment_logic) {
          setCounsellorRules(data.data.assignment_logic);
        }
        
        if (data.data.student_created_from && data.data.student_created_to) {
          setDateRange([
            dayjs(data.data.student_created_from),
            dayjs(data.data.student_created_to)
          ]);
        }
        
        setRuleStatus(data.data.status === 'active');
      } else {
        setIsEditMode(false);
        setCurrentRule(null);
      }
    } catch (error) {
      console.error("Fetch rule error:", error);
      setIsEditMode(false);
      setCurrentRule(null);
    }
  };

  useEffect(() => {
    fetchCurrentRule();
    loadCounsellors();
  }, []);

  const addCounsellorRule = () => {
    setCounsellorRules([...counsellorRules, { assignedCounsellor: "", limit: 1 }]);
  };

  const removeCounsellorRule = (index) => {
    if (counsellorRules.length > 1) {
      const newRules = [...counsellorRules];
      newRules.splice(index, 1);
      setCounsellorRules(newRules);
    }
  };

  const updateCounsellorRule = (index, field, value) => {
    const newRules = [...counsellorRules];
    newRules[index][field] = value;
    setCounsellorRules(newRules);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const invalidRules = counsellorRules.filter(rule => 
      !rule.assignedCounsellor || !rule.limit || rule.limit < 1
    );
    
    if (invalidRules.length > 0) {
      message.error("Please fill all counsellor fields with valid limits");
      setLoading(false);
      return;
    }

    if (!dateRange || dateRange.length !== 2) {
      message.error("Please select date range");
      setLoading(false);
      return;
    }

    // Only send dates in YYYY-MM-DD format
    const payload = {
      assignment_logic: counsellorRules,
      student_created_from: dateRange[0].format("YYYY-MM-DD"),
      student_created_to: dateRange[1].format("YYYY-MM-DD"),
      status: ruleStatus ? 'active' : 'inactive'
    };

    try {
      const res = await fetch(`${BASE_URL}/student-reassignment-logic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        message.success(isEditMode ? "Rule updated successfully" : "Rule created successfully");
        fetchCurrentRule();
      } else {
        message.error(data.message || "Failed to save rule");
      }
    } catch (error) {
      message.error("Failed to save assignment logic");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/student-reassignment-logic/toggle-status`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        message.success(`Rule ${data.data.status === 'active' ? 'activated' : 'deactivated'} successfully`);
        setRuleStatus(data.data.status === 'active');
        setCurrentRule(data.data);
      } else {
        message.error(data.message || "Failed to toggle status");
      }
    } catch (error) {
      message.error("Failed to toggle rule status");
    }
  };

  const handleDeleteRule = () => {
    Modal.confirm({
      title: 'Delete Assignment Rule',
      content: 'Are you sure you want to delete this assignment rule? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await fetch(`${BASE_URL}/student-reassignment-logic`, {
            method: "DELETE",
            credentials: "include",
          });

          const data = await res.json();

          if (data.success) {
            message.success("Rule deleted successfully");
            setCurrentRule(null);
            setIsEditMode(false);
            resetForm();
          } else {
            message.error(data.message || "Failed to delete rule");
          }
        } catch (error) {
          message.error("Failed to delete rule");
        }
      }
    });
  };

  const resetForm = () => {
    setCounsellorRules([{ assignedCounsellor: "", limit: 1 }]);
    setDateRange([dayjs(), dayjs().add(1, 'month')]);
    setRuleStatus(true);
  };

  const totalCapacity = counsellorRules.reduce((sum, rule) => sum + (rule.limit || 0), 0);
  const duration = dateRange && dateRange.length === 2 ? dateRange[1].diff(dateRange[0], 'day') + 1 : 0;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2 mb-2">
          <UserOutlined /> NI Leads Assignment Logic
        </Title>
        <Alert
          message={currentRule 
            ? "Edit the existing assignment rule. Only one rule can be active at a time." 
            : "Create a new assignment rule for NI leads. Only one rule can exist at a time."
          }
          type="info"
          showIcon
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEditMode ? <EditOutlined /> : <SaveOutlined />}
                  <span>{isEditMode ? 'Edit Assignment Rule' : 'Create Assignment Rule'}</span>
                </div>
                {currentRule && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Switch
                      checked={ruleStatus}
                      onChange={handleToggleStatus}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </div>
                )}
              </div>
            }
            className="shadow-sm"
            id="form-section"
          >
            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range <span className="text-red-500">*</span>
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
              {dateRange && dateRange.length === 2 && (
                <div className="mt-2 text-sm text-gray-600">
                  Duration: {duration} days
                </div>
              )}
            </div>

            {/* Counsellor Rules */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Counsellor Assignment Rules
                </label>
                <Button
                  type="dashed"
                  onClick={addCounsellorRule}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  Add Counsellor
                </Button>
              </div>

              <div className="space-y-4">
                {counsellorRules.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Rule {index + 1}</span>
                      {counsellorRules.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => removeCounsellorRule(index)}
                        />
                      )}
                    </div>
                    
                    <Row gutter={16}>
                      <Col span={14}>
                        <label className="block text-sm text-gray-600 mb-1">Counsellor</label>
                        <Select
                          placeholder="Select counsellor"
                          value={rule.assignedCounsellor}
                          onChange={(value) => updateCounsellorRule(index, 'assignedCounsellor', value)}
                          className="w-full"
                          loading={loadingCounsellors}
                          showSearch
                          optionFilterProp="children"
                        >
                          {counsellors.map((counsellor) => (
                            <Option key={counsellor.counsellor_id} value={counsellor.counsellor_name}>
                              {counsellor.counsellor_name}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <label className="block text-sm text-gray-600 mb-1">Limit</label>
                        <InputNumber
                          placeholder="Limit"
                          value={rule.limit}
                          onChange={(value) => updateCounsellorRule(index, 'limit', value)}
                          className="w-full"
                          min={1}
                          suffix={<NumberOutlined />}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>

           

            <div className="flex gap-3">
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<SaveOutlined />}
                className="flex-1 h-10"
              >
                {isEditMode ? 'Update Rule' : 'Create Rule'}
              </Button>
              
              {currentRule && (
                <Button
                  type="primary"
                  danger
                  onClick={handleDeleteRule}
                  icon={<DeleteOutlined />}
                  className="h-10"
                >
                  Delete Rule
                </Button>
              )}
            </div>
          </Card>

         
        </div>

        {/* Right Column - Real-time Preview */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined />
              <span>Real-time Assignment Flow Preview</span>
            </div>
          }
          className="shadow-sm h-full"
        >
          <div className="min-h-[600px]">
            {/* Flow Diagram */}
            <div className="text-center mb-10">
              {/* Source */}
              <div className="inline-block min-w-[200px] bg-blue-500 text-white rounded-lg p-5 shadow-md mb-2">
                <div className="text-xl font-semibold">NI Leads</div>
                <div className="text-blue-100 text-sm">Source</div>
              </div>

              {/* Status Badge */}
              {currentRule && (
                <div className="mb-4">
                  <Tag color={currentRule.status === 'active' ? 'success' : 'default'} size="large">
                    <PoweroffOutlined className="mr-1" />
                    {currentRule.status === 'active' ? 'ACTIVE RULE' : 'INACTIVE RULE'}
                  </Tag>
                </div>
              )}

              {/* Arrow */}
              <div className="my-5">
                <ArrowRightOutlined className="text-2xl text-gray-300 rotate-90" />
              </div>

              {/* Assignment Rules Preview */}
              <div className="max-w-md mx-auto">
                {counsellorRules.filter(r => r.assignedCounsellor).length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-10">
                    <Text type="secondary">
                      Add counsellors to see the flow visualization
                    </Text>
                  </div>
                ) : (
                  <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                    ruleStatus ? 'border-green-500 border border-green-500 bg-white' : 'border-gray-300 border border-gray-300 bg-white'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold mb-2">Date Range</div>
                        <div className="text-sm text-gray-600">
                          {dateRange[0].format("DD/MM/YYYY")} - {dateRange[1].format("DD/MM/YYYY")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {duration} days • {ruleStatus ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div>
                        {ruleStatus ? (
                          <Tag color="success">Active</Tag>
                        ) : (
                          <Tag color="default">Inactive</Tag>
                        )}
                      </div>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    <div className="space-y-3">
                      <div className="font-medium mb-2">Counsellors & Limits:</div>
                      {counsellorRules
                        .filter(rule => rule.assignedCounsellor)
                        .map((rule, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <UserOutlined className="text-gray-400" />
                              <span className="font-medium">{rule.assignedCounsellor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <NumberOutlined className="text-green-500" />
                              <span className="font-semibold text-green-600">Limit: {rule.limit}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Total Counsellors: </span>
                          <span className="font-semibold">{counsellorRules.filter(r => r.assignedCounsellor).length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Capacity: </span>
                          <span className="font-semibold text-green-600">{totalCapacity} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Final Arrow & Result */}
              {counsellorRules.filter(r => r.assignedCounsellor).length > 0 && (
                <>
                  <div className="my-5">
                    <ArrowRightOutlined className="text-2xl text-gray-300 rotate-90" />
                  </div>

                  {/* Result */}
                  <div className={`inline-block min-w-[200px] ${
                    ruleStatus ? 'bg-green-500' : 'bg-gray-400'
                  } text-white rounded-lg p-5 shadow-md`}>
                    <div className="text-xl font-semibold">Assigned Students</div>
                    <div className="text-white/80 text-sm">
                      {ruleStatus ? 'Will be assigned based on rules' : 'No assignments (rule inactive)'}
                    </div>
                    {ruleStatus && (
                      <div className="mt-2 text-white/90">
                        Total Capacity: <span className="font-bold">{totalCapacity} students</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Divider />

         
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManageNILeads;