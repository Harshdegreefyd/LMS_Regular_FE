import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    DatePicker,
    Select,
    Button,
    Spin,
    message,
    Modal
} from 'antd';
import {
    UserOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    DownloadOutlined,
    ReloadOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { BASE_URL } from '../../config/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Tracker4 = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'days'), dayjs()]);
    const [reportType, setReportType] = useState('counsellor');
    const [reportData, setReportData] = useState({ data: [], summary: {} });

    const API_BASE_URL = BASE_URL;

    const fetchData = async (isExport = false) => {
        if (!dateRange || dateRange.length < 2) {
            message.warning('Please select a date range');
            return;
        }

        if (isExport) {
            setExportLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const fromDate = dateRange[0].format('YYYY-MM-DD');
            const toDate = dateRange[1].format('YYYY-MM-DD');
            
            const params = {
                fromDate,
                toDate,
                reportType
            };

            // Add isExport parameter for export requests
            if (isExport) {
                params.isExport = true;
            }

            const response = await axios.get(`${API_BASE_URL}/studentcoursestatus/getnireports`, {
                params,
                responseType: isExport ? 'blob' : 'json' // Set response type for export
            });

            if (isExport) {
                // Handle export file download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `ni-report-${fromDate}-to-${toDate}-${reportType}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                message.success('Export completed successfully');
            } else {
                // Handle regular data fetch
                if (response.data.success) {
                    setReportData({
                        data: response.data.data || [],
                        summary: response.data.summary || {}
                    });
                    message.success('Data loaded successfully');
                } else {
                    message.error(response.data.message || 'Failed to load data');
                    setReportData({ data: [], summary: {} });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            
            if (isExport) {
                // Try to parse error message from blob if it's an export error
                if (error.response && error.response.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const errorData = JSON.parse(reader.result);
                            message.error(errorData.message || 'Failed to export data');
                        } catch (e) {
                            message.error('Failed to export data');
                        }
                    };
                    reader.readAsText(error.response.data);
                } else {
                    message.error('Failed to export data');
                }
            } else {
                message.error('Failed to load data. Please try again.');
                setReportData({ data: [], summary: {} });
            }
        } finally {
            if (isExport) {
                setExportLoading(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleExport = async () => {
        if (!dateRange || dateRange.length < 2) {
            message.warning('Please select a date range');
            return;
        }

        // Show confirmation modal for large date ranges
        const daysDiff = dateRange[1].diff(dateRange[0], 'days');
        if (daysDiff > 30) {
            Modal.confirm({
                title: 'Large Date Range Export',
                content: `You are about to export data for ${daysDiff + 1} days. This may take a while. Do you want to continue?`,
                okText: 'Yes, Export',
                cancelText: 'Cancel',
                onOk: () => fetchData(true)
            });
        } else {
            fetchData(true);
        }
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleRefresh = () => {
        fetchData(false);
    };

    const handleQuickSelect = (days) => {
        const end = dayjs();
        const start = dayjs().subtract(days, 'days');
        setDateRange([start, end]);
    };

    useEffect(() => {
        fetchData(false);
    }, [dateRange, reportType]);

    // Table columns (same as before)
    const columns = [
        {
            title: reportType === 'counsellor' ? 'Counsellor' : 'Time Slot',
            key: 'name',
            fixed: 'left',
            width: 180,
            render: (record) => (
                <div className="flex items-center space-x-3">
                    <div>
                        <div className="font-semibold text-sm text-nowrap">
                            {reportType === 'counsellor' ? record.counsellor_name || record.counsellor_id : record.time_slot}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Total Leads',
            dataIndex: 'total_leads',
            key: 'total_leads',
            width: 170,
            align: 'center',
            sorter: (a, b) => a.total_leads - b.total_leads,
            render: (count) => <div className="">{count}</div>,
        },
        {
            title: 'Connected',
            dataIndex: 'anytime_connected',
            key: 'anytime_connected',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.anytime_connected - b.anytime_connected,
            render: (count) => <div className=" ">{count}</div>,
        },
        {
            title: 'Connected %',
            dataIndex: 'connected_percentage',
            key: 'connected_percentage',
            width: 150,
            align: 'center',
            sorter: (a, b) => parseFloat(a.connected_percentage) - parseFloat(b.connected_percentage),
            render: (percentage) => <div>{percentage}%</div>,
        },
        {
            title: 'Total Remarks',
            dataIndex: 'total_remarks',
            key: 'total_remarks',
            width: 150,
            align: 'center',
            sorter: (a, b) => a.total_remarks - b.total_remarks,
            render: (count) => <div >{count}</div>,
        },
        {
            title: 'Remarks/Lead',
            dataIndex: 'remarks_percentage',
            key: 'remarks_percentage',
            width: 150,
            align: 'center',
            sorter: (a, b) => parseFloat(a.remarks_percentage) - parseFloat(b.remarks_percentage),
            render: (avg) => <div>{avg}</div>,
        },
        {
            title: 'ICC',
            dataIndex: 'icc_count',
            key: 'icc_count',
            width: 90,
            align: 'center',
            sorter: (a, b) => a.icc_count - b.icc_count,
            render: (count) => <div >{count}</div>,
        },
        {
            title: 'ICC %',
            dataIndex: 'icc_percentage',
            key: 'icc_percentage',
            width: 90,
            align: 'center',
            sorter: (a, b) => parseFloat(a.icc_percentage) - parseFloat(b.icc_percentage),
            render: (percentage) => <div>{percentage}%</div>,
        },
        {
            title: 'Form Filled',
            dataIndex: 'form_count',
            key: 'form_count',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.form_count - b.form_count,
            render: (count) => <div >{count}</div>,
        },
        {
            title: 'Form %',
            dataIndex: 'form_percentage',
            key: 'form_percentage',
            width: 120,
            align: 'center',
            sorter: (a, b) => parseFloat(a.form_percentage) - parseFloat(b.form_percentage),
            render: (percentage) => <div>{percentage}%</div>,
        },
        {
            title: 'Admission',
            dataIndex: 'admission_count',
            key: 'admission_count',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.admission_count - b.admission_count,
            render: (count) => <div >{count}</div>,
        },
        {
            title: 'Admission %',
            dataIndex: 'admission_percentage',
            key: 'admission_percentage',
            width: 140,
            align: 'center',
            sorter: (a, b) => parseFloat(a.admission_percentage) - parseFloat(b.admission_percentage),
            render: (percentage) => <div>{percentage}%</div>,
        },
        {
            title: 'Pre NI',
            dataIndex: 'pre_ni_count',
            key: 'pre_ni_count',
            width: 90,
            align: 'center',
            sorter: (a, b) => a.pre_ni_count - b.pre_ni_count,
            render: (count) => <div >{count}</div>,
        },
        {
            title: 'Pre NI %',
            dataIndex: 'pre_ni_percentage',
            key: 'pre_ni_percentage',
            width: 120,
            align: 'center',
            sorter: (a, b) => parseFloat(a.pre_ni_percentage) - parseFloat(b.pre_ni_percentage),
            render: (percentage) => <div>{percentage}%</div>,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:py-6 md:px-14">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChartOutlined className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">NI Reports Tracker</h1>
                            <p className="text-sm text-gray-500">
                                {dateRange && dateRange[0] && dateRange[1] ? 
                                    `${dateRange[0].format('DD MMM YYYY')} - ${dateRange[1].format('DD MMM YYYY')}` : 
                                    'Select date range'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 gap-2">
                        <div className="flex items-center space-x-2">
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                className="w-64"
                                suffixIcon={<CalendarOutlined />}
                                allowClear={false}
                            />
                        </div>
                        
                        <Select
                            value={reportType}
                            onChange={setReportType}
                            className="w-40"
                            size="middle"
                        >
                            <Option value="counsellor">
                                <div className="flex items-center space-x-2">
                                    <UserOutlined />
                                    <span>Counsellor</span>
                                </div>
                            </Option>
                            <Option value="timeslot">
                                <div className="flex items-center space-x-2">
                                    <ClockCircleOutlined />
                                    <span>Time Slot</span>
                                </div>
                            </Option>
                        </Select>
                        
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            type="primary"
                            className="bg-blue-600 border-blue-600"
                            loading={exportLoading}
                        >
                            Export
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                            className="border-gray-300"
                        />
                    </div>
                </div>

                {/* Quick Date Select Buttons */}
                <div className="flex space-x-2 mb-4">
                    <Button 
                        size="small" 
                        onClick={() => handleQuickSelect(1)}
                        className={dateRange && dateRange[0] && dateRange[0].isSame(dayjs().subtract(1, 'days')) ? 'bg-blue-100 text-blue-600' : ''}
                    >
                        Yesterday
                    </Button>
                    <Button 
                        size="small" 
                        onClick={() => handleQuickSelect(7)}
                        className={dateRange && dateRange[0] && dateRange[0].isSame(dayjs().subtract(7, 'days')) ? 'bg-blue-100 text-blue-600' : ''}
                    >
                        Last 7 Days
                    </Button>
                    <Button 
                        size="small" 
                        onClick={() => handleQuickSelect(30)}
                        className={dateRange && dateRange[0] && dateRange[0].isSame(dayjs().subtract(30, 'days')) ? 'bg-blue-100 text-blue-600' : ''}
                    >
                        Last 30 Days
                    </Button>
                    <Button 
                        size="small" 
                        onClick={() => handleQuickSelect(90)}
                        className={dateRange && dateRange[0] && dateRange[0].isSame(dayjs().subtract(90, 'days')) ? 'bg-blue-100 text-blue-600' : ''}
                    >
                        Last 90 Days
                    </Button>
                    <Button 
                        size="small" 
                        onClick={() => setDateRange([dayjs(), dayjs()])}
                        className={dateRange && dateRange[0] && dateRange[1] && dateRange[0].isSame(dateRange[1]) ? 'bg-blue-100 text-blue-600' : ''}
                    >
                        Today
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {reportData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="shadow-sm border-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Date Range</p>
                                <p className="font-semibold text-lg">
                                    {dateRange && dateRange[0] && dateRange[1] ? 
                                        `${dateRange[0].format('DD MMM')} - ${dateRange[1].format('DD MMM')}` : 
                                        'N/A'}
                                </p>
                            </div>
                            <CalendarOutlined className="text-blue-500 text-2xl" />
                        </div>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Total Leads</p>
                                <p className="font-semibold text-2xl text-blue-600">
                                    {reportData.summary.total_leads || 0}
                                </p>
                            </div>
                            <UserOutlined className="text-green-500 text-2xl" />
                        </div>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Connected</p>
                                <p className="font-semibold text-2xl text-green-600">
                                    {reportData.summary.anytime_connected || 0}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({reportData.summary.connected_percentage || '0.0'}%)
                                    </span>
                                </p>
                            </div>
                            <BarChartOutlined className="text-orange-500 text-2xl" />
                        </div>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Admissions</p>
                                <p className="font-semibold text-2xl text-purple-600">
                                    {reportData.summary.admission_count || 0}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({reportData.summary.admission_percentage || '0.0'}%)
                                    </span>
                                </p>
                            </div>
                            <ClockCircleOutlined className="text-purple-500 text-2xl" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Table */}
            <Card
                className="shadow-sm border-0"
                title={
                    <div className="flex items-center space-x-2">
                        <BarChartOutlined className="text-blue-500" />
                        <span className="font-semibold">
                            {reportType === 'counsellor' ? 'Counsellor Performance' : 'Time Slot Performance'}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                            (Counts with Percentages)
                        </span>
                    </div>
                }
                bodyStyle={{ padding: 0 }}
            >
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spin size="large" />
                    </div>
                ) : reportData.data.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={reportData.data}
                        rowKey={reportType === 'counsellor' ? 'counsellor_id' : 'time_slot'}
                        scroll={{ x: 1500 }}
                        pagination={{
                            pageSize: 15,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Total ${total} ${reportType === 'counsellor' ? 'counsellors' : 'time slots'}`,
                            className: 'px-4 py-3',
                            pageSizeOptions: ['10', '15', '20', '50']
                        }}
                        className="rounded-lg overflow-hidden"
                        summary={() => (
                            reportData.data.length > 0 && (
                                <Table.Summary fixed>
                                    <Table.Summary.Row className="bg-gray-50 font-semibold">
                                        <Table.Summary.Cell index={0} className="font-semibold">
                                            <div className="flex items-center space-x-3">
                                                <div className="font-semibold text-sm">TOTAL</div>
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} className="text-center">
                                            <div>{reportData.summary?.total_leads || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} className="text-center">
                                            <div >{reportData.summary?.anytime_connected || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} className="text-center">
                                            <div className={`font-medium `}>
                                                {reportData.summary?.connected_percentage || '0.0'}%
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4} className="text-center">
                                            <div >{reportData.summary?.total_remarks || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} className="text-center">
                                            <div className="font-medium ">
                                                {reportData.summary?.remarks_percentage || '0.0'}
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={6} className="text-center">
                                            <div className=" text-base ">{reportData.summary?.icc_count || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={7} className="text-center">
                                            <div className="font-medium ">
                                                {reportData.summary?.icc_percentage || '0.0'}%
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={8} className="text-center">
                                            <div className="text-base ">{reportData.summary?.form_count || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={9} className="text-center">
                                            <div className="font-medium ">
                                                {reportData.summary?.form_percentage || '0.0'}%
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={10} className="text-center">
                                            <div className="font-bold text-base ">{reportData.summary?.admission_count || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={11} className="text-center">
                                            <div className="font-medium ">
                                                {reportData.summary?.admission_percentage || '0.0'}%
                                            </div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={12} className="text-center">
                                            <div >{reportData.summary?.pre_ni_count || 0}</div>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={13} className="text-center">
                                            <div className="font-medium ">
                                                {reportData.summary?.pre_ni_percentage || '0.0'}%
                                            </div>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )
                        )}
                    />
                ) : (
                    <div className="py-20 text-center">
                        <div className="text-gray-300 text-5xl mb-4">
                            <BarChartOutlined />
                        </div>
                        <h3 className="text-lg font-medium text-gray-500 mb-2">No Data Available</h3>
                        <p className="text-gray-400">Try selecting a different date range</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Tracker4;