import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  PhoneCall, 
  FileText, 
  PieChart,
  Layers,
  X,
  ChevronRight
} from 'lucide-react';

const ReportSwitcherFAB = ({ activeLevel, setActiveLevel, activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const levels = [
    { id: 'lead', label: 'Lead Level', description: 'Tracking & Acquisition' },
    { id: 'admission', label: 'Admission Level', description: 'Coming Soon' },
    { id: 'application', label: 'Application Level', description: 'Coming Soon' }
  ];

  const reports = [
    { id: 'api', label: 'API Analytics', icon: LayoutDashboard, description: 'Response monitoring' },
    { id: 'remarks', label: 'Remarks Analysis', icon: PieChart, description: 'Counsellor activity' },
    { id: 'track', label: 'Track Report', icon: BarChart2, description: 'Daily tracking summary' },
    { id: 'attempt', label: 'Lead Attempt', icon: PhoneCall, description: 'Connectivity stats' },
    { id: 'tracker2', label: 'Tracker Report 2', icon: FileText, description: 'Unique remark tracking' },
    { id: 'tracker3', label: 'Tracker Report 3', icon: PieChart, description: 'Attribute transformation' }
  ];

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white"
        >
          <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Layers size={32} className="relative z-10" />
          
          <div className="absolute right-24 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 pointer-events-none shadow-2xl border border-slate-700">
            Switch Report
          </div>
        </button>
      </div>

      {/* Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-1">Navigation Hub</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Main Portal Switch</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-4 bg-white text-slate-400 rounded-3xl hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm border border-slate-200"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-10 lg:p-12 overflow-y-auto max-h-[75vh]">
              {/* Hierarchical Levels */}
              <div className="mb-12">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Select Analytical Level</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setActiveLevel(level.id)}
                      className={`p-6 rounded-3xl border-2 transition-all duration-300 text-left relative group ${
                        activeLevel === level.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.05]'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50'
                      }`}
                    >
                      <h3 className={`font-black text-xl mb-1 ${activeLevel === level.id ? 'text-white' : 'text-slate-900'}`}>
                        {level.label}
                      </h3>
                      <p className={`text-sm font-bold ${activeLevel === level.id ? 'text-blue-50' : 'text-slate-500'}`}>
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Reports for Lead Level */}
              {activeLevel === 'lead' && (
                <div className="animate-in slide-in-from-top-12 duration-700">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Available Lead Reports</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => {
                      const Icon = report.icon;
                      const isActive = activeTab === report.id;
                      
                      return (
                        <button
                          key={report.id}
                          onClick={() => {
                            setActiveTab(report.id);
                            setIsOpen(false);
                          }}
                          className={`flex flex-col items-start gap-4 p-6 rounded-[2rem] border-2 text-left transition-all duration-300 group ${
                            isActive 
                              ? 'bg-blue-50 border-blue-600 shadow-lg ring-8 ring-blue-500/5' 
                              : 'bg-white border-slate-50 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                          <div className={`p-4 rounded-2xl transition-all duration-300 ${
                            isActive ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-lg font-black tracking-tight ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                                {report.label}
                              </span>
                              {isActive && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                            </div>
                            <p className={`text-xs font-bold leading-relaxed ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>
                              {report.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(activeLevel === 'admission' || activeLevel === 'application') && (
                <div className="flex flex-col items-center justify-center p-20 text-center animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 ring-8 ring-blue-50/50">
                      <Layers className="w-12 h-12 text-blue-600" />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 mb-4">Module Locked</h3>
                   <p className="text-slate-500 max-w-sm font-bold text-lg leading-relaxed">
                     The <span className="text-blue-600 capitalize">{activeLevel}</span> intelligence engine is currently being compiled.
                   </p>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-950 flex items-center justify-center">
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
                Enterprise Analytics Framework v4.0
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportSwitcherFAB;
