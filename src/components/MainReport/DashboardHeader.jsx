import React from 'react';

const DashboardHeader = ({ 
  title = "Analytics Dashboard", 
  subtitle = "Enterprise Data Hub", 
  actions 
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {actions}
      </div>
    </div>
  );
};

export default DashboardHeader;
