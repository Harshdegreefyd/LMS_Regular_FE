import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    message,
    Space,
    Tag,
    Typography,
    Row,
    Col,
    List
} from 'antd';
import {
    HeartOutlined,
    HeartFilled,
    InfoCircleOutlined,
    CloseOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    BankOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
    StarOutlined,
    BulbOutlined
} from '@ant-design/icons';
import { updatetheCourseStatus } from '../network/courseStudentStatus';

const { Title, Text } = Typography;

const CourseRow = ({ course, studentId, onStatusChange }) => {
    const [isShortlisted, setIsShortlisted] = useState(course.isShortlisted || false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setIsShortlisted(course.isShortlisted || false);
    }, [course.isShortlisted]);

    const handleShortlist = async () => {
        try {
            setIsLoading(true);
            await updatetheCourseStatus(course.courseId, studentId, "Shortlisted", true);
            setIsShortlisted(true);
            message.success('Course added to shortlist successfully!');
            if (onStatusChange) {
                onStatusChange(course.courseId, "Shortlisted");
            }
        } catch (error) {
            console.error("Error shortlisting course:", error);
            message.error('Failed to add course to shortlist');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount);
    };

    const getSemesterFee = () => {
        if (course.semFee) return course.semFee;
        if (course.annualFee && course.duration) {
            const annual = parseFloat(course.annualFee);
            const duration = parseFloat(course.duration);
            return (annual / duration / 2).toFixed(0);
        }
        return null;
    };

    const getTotalFee = () => {
        if (course.totalFees) return course.totalFees;
        if (course.annualFee && course.duration) {
            const annual = parseFloat(course.annualFee);
            const duration = parseFloat(course.duration);
            return (annual * duration).toString();
        }
        return null;
    };

    const semesterFee = getSemesterFee();
    const totalFee = getTotalFee();

    const uspItems = Array.isArray(course.usp) && course.usp.length > 0
        ? course.usp
        : [
            "Industry-relevant curriculum",
            "Experienced faculty members",
            "Placement assistance",
            "Modern infrastructure",
            "Industry collaborations"
        ];

    const eligibilityItems = Array.isArray(course.eligibility) && course.eligibility.length > 0
        ? course.eligibility
        : [
            `Minimum ${course.level === 'UG' ? '12th' : 'Graduation'} pass`,
            "Minimum 50% aggregate marks",
            "Valid entrance exam score if required",
            "No gap year preferred"
        ];

    return (
        <>
            <td className="py-1.5 px-4">
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '14px' }}>{course.courseName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{course.degreeName}</Text>
                </Space>
            </td>

            <td className="py-4 px-4">
                <Tag color="blue">
                    {course.specialization || 'General'}
                </Tag>
            </td>
            <td className="py-4 px-4 text-center">
                <Tag >
                    {course.level || 'General'}
                </Tag>
            </td>

            <td className="py-4 px-4 text-center">
                <Space>
                    <Text>{course.duration} Years</Text>
                </Space>
            </td>

            <td className="py-4 px-4 text-center">
                <Text style={{ fontSize: '14px', color: 'black' }}>
                    {formatCurrency(semesterFee)}
                </Text>
            </td>
            <td className="py-4 px-4  text-center">
                <Space>
                    <Text>                            {formatCurrency(course.annualFee)}
                    </Text>
                </Space>
            </td>
            <td className="py-4 px-4 text-center">
                <Space>
                    <Text>                            {formatCurrency(course.totalFees)}
                    </Text>
                </Space>
            </td>
            <td className=" pt-4 px-4 flex flex-col-reverse  items-center justify-center" >
                <Button
                    type={isShortlisted ? "primary" : "default"}
                    icon={isShortlisted ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleShortlist}
                    loading={isLoading}
                    size="middle"
                    danger={isShortlisted}
                    className='border-4'
                >
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
            </td>

            <Modal
                title={null}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={900}
                closeIcon={<CloseOutlined style={{ color: '#666' }} />}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px',
                    color: 'white'
                }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={3} style={{ color: 'white', margin: 0 }}>
                                {course.courseName}
                            </Title>
                            <Space size={4} style={{ marginTop: '8px' }}>
                                <BankOutlined />
                                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                    {course.universityName}
                                </Text>
                            </Space>
                        </Col>
                        <Col>
                            <Tag color="white" style={{ color: '#667eea', fontWeight: 'bold' }}>
                                {course.degreeName}
                            </Tag>
                        </Col>
                    </Row>
                </div>

                <Row gutter={0} style={{ height: '500px' }}>
                    <Col span={12} style={{
                        padding: '24px',
                        borderRight: '1px solid #f0f0f0',
                        backgroundColor: '#fafafa',
                        height: '100%',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                backgroundColor: '#1890ff',
                                borderRadius: '50%',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <StarOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            <Title level={4} style={{ margin: 0 }}>Course Highlights (USP)</Title>
                        </div>

                        <List
                            dataSource={uspItems}
                            renderItem={(item, index) => (
                                <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                                    <Space align="start" style={{ width: '100%' }}>
                                        <div style={{
                                            backgroundColor: '#e6f7ff',
                                            borderRadius: '4px',
                                            padding: '8px',
                                            minWidth: '36px',
                                            textAlign: 'center'
                                        }}>
                                            <BulbOutlined style={{ color: '#1890ff' }} />
                                        </div>
                                        <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>{item}</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Col>

                    <Col span={12} style={{
                        padding: '24px',
                        height: '100%',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                backgroundColor: '#52c41a',
                                borderRadius: '50%',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircleOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            <Title level={4} style={{ margin: 0 }}>Eligibility Criteria</Title>
                        </div>

                        <List
                            dataSource={eligibilityItems}
                            renderItem={(item, index) => (
                                <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                                    <Space align="start" style={{ width: '100%' }}>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: '4px' }} />
                                        <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>{item}</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #f0f0f0',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Space>
                        <Text type="secondary">Course ID: {course.courseId}</Text>
                    </Space>
                    <Space>
                        <Button onClick={() => setModalVisible(false)}>
                            Close
                        </Button>
                        <Button
                            type="primary"
                            icon={isShortlisted ? <HeartFilled /> : <HeartOutlined />}
                            onClick={() => {
                                handleShortlist();
                                setModalVisible(false);
                            }}
                            loading={isLoading}
                            style={{
                                backgroundColor: isShortlisted ? '#f5222d' : '#1890ff',
                                borderColor: isShortlisted ? '#f5222d' : '#1890ff'
                            }}
                        >
                            {isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                        </Button>
                    </Space>
                </div>
            </Modal>
        </>
    );
};

export default CourseRow;