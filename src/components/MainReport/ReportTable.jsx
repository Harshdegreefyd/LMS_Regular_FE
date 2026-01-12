import React from 'react';
import { FiLoader, FiInbox } from 'react-icons/fi';

const ReportTable = ({ 
  columns, 
  data, 
  loading, 
  emptyText = "No data found",
  rowClassName = (item) => "" 
}) => {
  return (
    <div className="overflow-x-auto relative rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-blue-600 border-b border-blue-700">
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                className={`px-4 py-2.5 text-[11px] font-bold text-white text-nowrap uppercase tracking-wider ${col.align === 'center' ? 'text-center' : ''}`}
              >
                {col.headerRender || col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Analyzing Data Pipeline...</p>
                </div>
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((item, idx) => (
              <tr 
                key={idx} 
                className={`group hover:bg-blue-50/30 transition-all duration-150 ${rowClassName(item)} ${item.rowClass || ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={col.key || colIdx} 
                    className={`px-4 py-2.5 text-xs text-nowrap text-slate-700 font-medium border-r border-slate-50 last:border-r-0 ${col.align === 'center' ? 'text-center' : ''}`}
                  >
                    {col.render 
                      ? col.render(item[col.key], item) 
                      : typeof item[col.key] === 'object' && item[col.key] !== null
                        ? item[col.key].count ?? JSON.stringify(item[col.key])
                        : item[col.key] ?? '—'
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-24 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <FiInbox className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{emptyText}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;