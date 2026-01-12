import { Filter } from 'lucide-react';

const Header = ({ 
  showFilters, 
  setShowFilters, 
  loading, 
  activeTab, 
  leadSubTab, 
  showDetailedColumns, 
  setShowDetailedColumns 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Report Analysis Dashboard</h1>
          <p className="text-sm text-gray-600">Comprehensive analysis of admissions, applications, and leads</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'lead' && leadSubTab !== 'api' && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Remarks View</span>
              <button
                onClick={() => setShowDetailedColumns(!showDetailedColumns)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showDetailedColumns ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                  showDetailedColumns ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-lg font-semibold transition-all shadow-sm ${
              showFilters
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                Open
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
