import React, { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, ChevronDown, ChevronRight, Inbox, Filter } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../config/api';
import ReportTable from '../MainReport/ReportTable';

const NotInterestedReportTable = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [error, setError] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [expandedSupervisors, setExpandedSupervisors] = useState({});

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (fromDate) params.append('created_at_start', fromDate);
            if (toDate) params.append('created_at_end', toDate);

            const response = await axios.get(
                `${BASE_URL}/studentcoursestatus/not-interested-after-counseling?${params.toString()}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setData(response.data.data);
                if (response.data.groupedBySupervisor) {
                    const grouped = {};
                    response.data.groupedBySupervisor.forEach(s => {
                        grouped[s.supervisorName] = s;
                    });
                    setGroupedData(grouped);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSupervisor = (name) => {
        setExpandedSupervisors(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const params = new URLSearchParams();
            if (fromDate) params.append('created_at_start', fromDate);
            if (toDate) params.append('created_at_end', toDate);

            const response = await axios.get(
                `${BASE_URL}/studentcoursestatus/not-interested-after-counseling/export?${params.toString()}`,
                { responseType: 'blob', withCredentials: true }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ni_report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            setExportLoading(false);
        }
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Supervisor / Counsellor',
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    {row.isSupervisor && (
                        <button onClick={() => toggleSupervisor(row.supervisorName)}>
                            {expandedSupervisors[row.supervisorName] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                    <span className={row.isSupervisor ? "font-black text-slate-900" : "pl-6 text-slate-500 font-medium"}>
                        {row.isSupervisor ? row.supervisorName : row.counsellor_name}
                    </span>
                </div>
            )
        },
        { 
            key: 'count', 
            label: 'NI Count', 
            align: 'center',
            render: (val, row) => (
                <span className={`font-black ${row.isSupervisor ? 'text-red-600' : 'text-slate-900'}`}>
                    {row.isSupervisor ? row.total_ni : row.ni_count}
                </span>
            )
        }
    ];

    const tableData = useMemo(() => {
        const flattened = [];
        Object.values(groupedData).sort((a,b) => a.supervisorName.localeCompare(b.supervisorName)).forEach(s => {
            flattened.push({ ...s, isSupervisor: true, rowClass: 'bg-slate-50/50' });
            if (expandedSupervisors[s.supervisorName]) {
                s.counsellors.forEach(c => flattened.push(c));
            }
        });
        return flattened;
    }, [groupedData, expandedSupervisors]);

    const totalNICount = Object.values(groupedData).reduce((sum, s) => sum + (s.total_ni || 0), 0);

    return (
        <div className="flex flex-col mt-8 border-t border-slate-100">
            <div className="p-6 flex items-center justify-between bg-slate-50/10">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Churn Analysis</span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">Pre-NI Loss Report</h4>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate loss</span>
                            <span className="text-lg font-black text-red-600 leading-none">{totalNICount}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                        <input 
                            type="date" 
                            className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-2 outline-none"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                        />
                        <span className="text-slate-300">→</span>
                        <input 
                            type="date" 
                            className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-2 outline-none"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                    >
                        {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        <span className="text-xs font-black uppercase tracking-widest">Export NI</span>
                    </button>
                </div>
            </div>

            <ReportTable 
                columns={columns}
                data={tableData}
                loading={loading}
                emptyText="No churn data identified in this pipeline"
            />
        </div>
    );
};

export default NotInterestedReportTable;