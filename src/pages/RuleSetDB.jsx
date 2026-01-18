import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Input,
  Button,
  List,
  Tag,
  Spin,
  Alert,
  Typography,
  Space,
  Divider,
  Timeline,
  Modal,
  message as antMessage,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  HistoryOutlined,
  ReloadOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { BASE_URL } from "../config/api";

const { Title, Text } = Typography;

const RuleSetDB = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [newCampaign, setNewCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRuleset = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/dbRuleset`, {
        isCredentials: true,
      });
      if (res.data) {
        setCampaigns(res.data.campaign_id || []);
        setHistory(res.data.history || []);
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to load ruleset");
      antMessage.error("Failed to load ruleset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuleset();
  }, []);

  const addCampaign = () => {
    if (newCampaign.trim() === "") {
      antMessage.warning("Please enter a campaign ID");
      return;
    }

    if (campaigns.includes(newCampaign)) {
      antMessage.warning("Campaign ID already exists");
      return;
    }

    setCampaigns([...campaigns, newCampaign]);
    setNewCampaign("");
    antMessage.success("Campaign added successfully");
  };

  const removeCampaign = (id) => {
    Modal.confirm({
      title: "Remove Campaign ID",
      content: `Are you sure you want to remove campaign "${id}"?`,
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        setCampaigns(campaigns.filter((c) => c !== id));
        antMessage.success("Campaign removed successfully");
      },
    });
  };

  const saveRuleset = async () => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await axios.post(
        `${BASE_URL}/dbRuleset`,
        {
          campaign_id: campaigns,
        },
        { withCredentials: true }, 
      );

      setMessage(res.data.message || "Ruleset saved successfully");
      setHistory(res.data.ruleset?.history || []);
      antMessage.success("Ruleset saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error saving ruleset");
      antMessage.error("Error saving ruleset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (campaigns.length === 0) {
      Modal.confirm({
        title: "No Campaigns Added",
        content: "You are about to save an empty ruleset. Continue?",
        okText: "Continue",
        cancelText: "Cancel",
        onOk: async () => {
          await saveRuleset();
        },
      });
      return;
    }
    await saveRuleset();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addCampaign();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Card className="mx-auto">
        <Spin spinning={loading}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <IdcardOutlined className="text-2xl text-blue-600" />
              <div>
                <Title level={3} className="!mb-1">
                  Regular DB Ruleset
                </Title>
                <Text type="secondary">
                  Manage campaign IDs and track changes
                </Text>
              </div>
            </div>

            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRuleset}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={campaigns.length === 0}
              >
                Save Ruleset
              </Button>
            </Space>
          </div>

          {message && (
            <Alert
              message={message}
              type={
                message.includes("Error") || message.includes("Failed")
                  ? "error"
                  : "success"
              }
              showIcon
              closable
              onClose={() => setMessage("")}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title={
                <div className="flex items-center">
                  <span className="mr-5">Campaign IDs</span>
                  <Tag className="ml-5" color="blue">
                    {campaigns.length}
                  </Tag>
                </div>
              }
              bordered={false}
              className="shadow-sm"
            >
              <div className="mb-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter new campaign ID"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="large"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    disabled={loading || isSubmitting}
                    className="flex-grow"
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addCampaign}
                    disabled={loading || isSubmitting}
                    size="large"
                  >
                    Add
                  </Button>
                </div>
                <Text type="secondary" className="mt-2 block">
                  Press Enter or click Add to include a new campaign
                </Text>
              </div>

              <Divider orientation="left">
                <Text type="secondary">Current Campaigns</Text>
              </Divider>

              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <DeleteOutlined className="text-3xl text-gray-300 mb-2" />
                  <Text type="secondary" className="block">
                    No campaigns added yet
                  </Text>
                </div>
              ) : (
                <List
                  dataSource={campaigns}
                  renderItem={(campaign) => (
                    <List.Item
                      className="hover:bg-gray-50 rounded-lg transition-colors duration-150"
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeCampaign(campaign)}
                          disabled={loading || isSubmitting}
                        >
                          Remove
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IdcardOutlined className="text-blue-600" />
                          </div>
                        }
                        title={<Text strong>{campaign}</Text>}
                        description={`Campaign ID`}
                      />
                    </List.Item>
                  )}
                  className="max-h-96 overflow-y-auto"
                />
              )}
            </Card>

            <Card
              title={
                <div className="flex items-center">
                  <HistoryOutlined className="mr-2 text-gray-600" />
                  <span className="mr-5">History Log</span>
                  {history.length > 0 && (
                    <Tag className="ml-2" color="gray">
                      {history.length}
                    </Tag>
                  )}
                </div>
              }
              bordered={false}
              className="shadow-sm"
            >
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <HistoryOutlined className="text-3xl text-gray-300 mb-2" />
                  <Text type="secondary" className="block">
                    No history available
                  </Text>
                  <Text type="secondary">
                    Changes will appear here after saving
                  </Text>
                </div>
              ) : (
                <Timeline className="mt-4">
                  {history
                    .slice(-10)
                    .reverse()
                    .map((h, idx) => (
                      <Timeline.Item
                        key={idx}
                        color={
                          h.action === "created"
                            ? "green"
                            : h.action === "updated"
                              ? "blue"
                              : h.action === "deleted"
                                ? "red"
                                : "gray"
                        }
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <Text strong className="capitalize">
                              {h.action}
                            </Text>
                            <Text type="secondary" className="text-xs">
                              {new Date(h.timestamp).toLocaleString()}
                            </Text>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Text type="secondary" className="text-sm">
                              by
                            </Text>
                            <Tag color="purple" className="!m-0">
                              {h.userId || "Unknown User"}
                            </Tag>
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                </Timeline>
              )}

              {history.length > 10 && (
                <div className="mt-4 text-center">
                  <Text type="secondary" className="text-sm">
                    Showing last 10 of {history.length} entries
                  </Text>
                </div>
              )}
            </Card>
          </div>

          <Divider />
          <div className="flex justify-between items-center">
            <div>
              <Text type="secondary">
                Total Campaigns: <Tag>{campaigns.length}</Tag>
              </Text>
            </div>
            <Space>
              <Button
                onClick={() => {
                  setCampaigns([]);
                  setNewCampaign("");
                  antMessage.info("Campaign list cleared");
                }}
                danger
                disabled={campaigns.length === 0 || loading || isSubmitting}
              >
                Clear All
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={campaigns.length === 0 || loading}
                size="large"
              >
                Save Ruleset
              </Button>
            </Space>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default RuleSetDB;
