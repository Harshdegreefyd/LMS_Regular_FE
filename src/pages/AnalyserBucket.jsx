import React, { useState, useEffect } from 'react';
import {
  Plus, Edit3, MoreVertical, User, Mail, Lock, Eye, EyeOff,
  Check, X, Grid, List, AlertTriangle, LogOut, ChevronDown,
  Search, ChevronLeft, ChevronRight, Trash2, Calendar, ChevronsUpDown
} from 'lucide-react';
import Modal from '../common/Modal';
import { fetchAnalysers, createAnalyser, updateAnalyser, deleteAnalyser, forceLogoutAnalyser } from '../network/analyserApi.js';
import { fetchFilterOptions } from '../network/filterOptions';

const CompactMultiSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(value || []);

  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const selectedCount = selectedOptions.length;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <div className="flex flex-wrap gap-1 max-w-[85%]">
          {selectedCount === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.slice(0, 2).map((option, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {option}
                </span>
              ))}
              {selectedCount > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{selectedCount - 2}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400 ml-2`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <label key={option} className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${selectedOptions.includes(option) ? 'bg-blue-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Done ({selectedCount})
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setSelectedOptions([]);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="py-1.5 px-3 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors border border-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Date Range Picker Component
const DateRangePicker = ({ value, onChange }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const predefinedRanges = [
    { label: 'Today', value: "created_at = CURDATE()" },
    { label: 'Yesterday', value: "created_at = CURDATE() - INTERVAL 1 DAY" },
    { label: 'Last 7 Days', value: "created_at >= CURDATE() - INTERVAL 7 DAY" },
    { label: 'Last 30 Days', value: "created_at >= CURDATE() - INTERVAL 30 DAY" },
    { label: 'This Month', value: "created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')" },
    { label: 'Last Month', value: "created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')" },
    { label: 'This Year', value: "created_at >= DATE_FORMAT(CURDATE(), '%Y-01-01')" },
    { label: 'All Time', value: "" }
  ];

  useEffect(() => {
    if (value) {
      // Check if value matches any predefined range
      const matchedRange = predefinedRanges.find(range => range.value === value);
      if (matchedRange) {
        setIsCustom(false);
      } else {
        setIsCustom(true);
        // Try to parse custom date range
        const fromMatch = value.match(/created_at >= '(\d{4}-\d{2}-\d{2})'/);
        const toMatch = value.match(/created_at <= '(\d{4}-\d{2}-\d{2})'/);
        if (fromMatch && toMatch) {
          setDateRange({
            from: fromMatch[1],
            to: toMatch[1]
          });
        }
      }
    }
  }, [value]);

  const handlePredefinedSelect = (rangeValue) => {
    onChange(rangeValue);
    setIsCustom(false);
    setShowPicker(false);
  };

  const handleCustomDateChange = () => {
    if (dateRange.from && dateRange.to) {
      const customValue = `created_at >= '${dateRange.from}' AND created_at <= '${dateRange.to}'`;
      onChange(customValue);
      setShowPicker(false);
    }
  };

  const formatDisplayValue = (val) => {
    if (!val) return 'Select date range...';
    const matchedRange = predefinedRanges.find(range => range.value === val);
    if (matchedRange) return matchedRange.label;
    
    // Format custom range
    const fromMatch = val.match(/created_at >= '(\d{4}-\d{2}-\d{2})'/);
    const toMatch = val.match(/created_at <= '(\d{4}-\d{2}-\d{2})'/);
    if (fromMatch && toMatch) {
      return `${fromMatch[1]} to ${toMatch[1]}`;
    }
    return 'Custom range';
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Student Creation Date Filter</label>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400 w-4 h-4" />
          <span className="text-sm text-gray-900">{formatDisplayValue(value)}</span>
        </div>
        <ChevronsUpDown size={16} className="text-gray-400" />
      </button>

      {showPicker && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className={`flex-1 py-2 text-sm rounded-md ${!isCustom ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Quick Select
              </button>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`flex-1 py-2 text-sm rounded-md ${isCustom ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Custom Range
              </button>
            </div>

            {!isCustom ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {predefinedRanges.map((range, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePredefinedSelect(range.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 ${value === range.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCustomDateChange}
                  disabled={!dateRange.from || !dateRange.to}
                  className={`w-full py-2 text-sm rounded-md ${!dateRange.from || !dateRange.to ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Apply Custom Range
                </button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPicker(false);
                setIsCustom(false);
              }}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setDateRange({ from: '', to: '' });
                setIsCustom(false);
                setShowPicker(false);
              }}
              className="py-1.5 px-3 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors border border-red-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AddEditModalContent = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  selectedAnalyser,
  addSourceUrl,
  updateSourceUrl,
  removeSourceUrl,
  SOURCES_OPTIONS,
  CAMPAIGNS_OPTIONS
}) => (
  <div className="space-y-6 p-0">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter email address"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required={!selectedAnalyser}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 pr-12 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={selectedAnalyser ? 'Leave blank to keep current' : 'Enter password'}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CompactMultiSelect
        label="Sources"
        value={formData.sources}
        onChange={(selected) => setFormData({ ...formData, sources: selected })}
        options={SOURCES_OPTIONS}
        placeholder="Select sources..."
      />
      <CompactMultiSelect
        label="Campaigns"
        value={formData.campaigns}
        onChange={(selected) => setFormData({ ...formData, campaigns: selected })}
        options={CAMPAIGNS_OPTIONS}
        placeholder="Select campaigns..."
      />
    </div>

    <DateRangePicker
      value={formData.student_creation_date}
      onChange={(value) => setFormData({ ...formData, student_creation_date: value })}
    />

    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">Source URLs</label>
        <button
          type="button"
          onClick={addSourceUrl}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-all flex items-center gap-1"
        >
          <Plus size={14} />
          Add URL
        </button>
      </div>
      <div className="space-y-3">
        {formData.source_urls.map((url, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => updateSourceUrl(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={`Source URL ${index + 1}`}
              />
            </div>
            <button
              type="button"
              onClick={() => removeSourceUrl(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AnalyserBucket = () => {
  const [analysers, setAnalysers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCardView, setIsCardView] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [selectedAnalyser, setSelectedAnalyser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sources: [],
    source_urls: [],
    student_creation_date: '',
    campaigns: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1
  });
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState({
    sources: [],
    campaigns: []
  });

  const loadOptions = async () => {
    try {
      const data = await fetchFilterOptions();
      setOptions({
        sources: [...(data?.data?.source || []), 'Any'],
        campaigns: [...(data?.data?.utm_campaign || data?.data?.campaign_name || []), 'Any']
      });
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadAnalysers = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalysers({
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setAnalysers(data.analysers);
      setPagination({
        page: data.page,
        limit: pagination.limit,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch (error) {
      console.error('Error loading analysers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadAnalysers();
  }, [pagination.page, search]);

  const handleAddAnalyser = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      sources: [],
      source_urls: [],
      student_creation_date: '',
      campaigns: []
    });
    setSelectedAnalyser(null);
    setShowAddModal(true);
  };

  const handleEditAnalyser = (analyser) => {
    setSelectedAnalyser(analyser);
    setFormData({
      name: analyser.name,
      email: analyser.email,
      password: '',
      sources: analyser.sources || [],
      source_urls: analyser.source_urls || [],
      student_creation_date: analyser.student_creation_date || '',
      campaigns: analyser.campaigns || []
    });
    setShowEditModal(true);
  };

  const handleDeleteAnalyser = (analyser) => {
    setSelectedAnalyser(analyser);
    setShowDeleteModal(true);
  };

  const handleForceLogout = (analyser) => {
    setSelectedAnalyser(analyser);
    setShowForceLogoutModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAnalyser) {
        await updateAnalyser(selectedAnalyser.id, formData);
      } else {
        await createAnalyser(formData);
      }
      loadAnalysers();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedAnalyser(null);
    } catch (error) {
      console.error('Error saving analyser:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteAnalyser(selectedAnalyser.id);
      loadAnalysers();
      setShowDeleteModal(false);
      setSelectedAnalyser(null);
    } catch (error) {
      console.error('Error deleting analyser:', error);
    }
  };

  const confirmForceLogout = async () => {
    try {
      await forceLogoutAnalyser(selectedAnalyser.id);
      loadAnalysers();
      setShowForceLogoutModal(false);
      setSelectedAnalyser(null);
    } catch (error) {
      console.error('Error force logging out:', error);
    }
  };

  const addSourceUrl = () => {
    setFormData({
      ...formData,
      source_urls: [...formData.source_urls, '']
    });
  };

  const updateSourceUrl = (index, value) => {
    const updatedUrls = formData.source_urls.map((url, i) =>
      i === index ? value : url
    );
    setFormData({ ...formData, source_urls: updatedUrls });
  };

  const removeSourceUrl = (index) => {
    const updatedUrls = formData.source_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, source_urls: updatedUrls });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatDateFilter = (filterString) => {
    if (!filterString) return 'All Time';
    
    // Check for predefined ranges
    const predefinedLabels = {
      "created_at = CURDATE()": 'Today',
      "created_at = CURDATE() - INTERVAL 1 DAY": 'Yesterday',
      "created_at >= CURDATE() - INTERVAL 7 DAY": 'Last 7 Days',
      "created_at >= CURDATE() - INTERVAL 30 DAY": 'Last 30 Days',
      "created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')": 'This Month',
      "created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')": 'Last Month',
      "created_at >= DATE_FORMAT(CURDATE(), '%Y-01-01')": 'This Year'
    };

    if (predefinedLabels[filterString]) {
      return predefinedLabels[filterString];
    }

    // Format custom range
    const fromMatch = filterString.match(/created_at >= '(\d{4}-\d{2}-\d{2})'/);
    const toMatch = filterString.match(/created_at <= '(\d{4}-\d{2}-\d{2})'/);
    if (fromMatch && toMatch) {
      return `${formatDisplayDate(fromMatch[1])} to ${formatDisplayDate(toMatch[1])}`;
    }

    return 'Custom Filter';
  };

  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyser Management</h1>
          <p className="text-gray-600 mt-1">Manage analysers, their access & permissions</p>
        </div>
        <button
          onClick={handleAddAnalyser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={20} />
          Add Analyser
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search analysers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setIsCardView(false)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${!isCardView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <List size={18} />
            Table
          </button>
          <button
            onClick={() => setIsCardView(true)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${isCardView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <Grid size={18} />
            Cards
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {!isCardView ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="min-h-96 overflow-y-scroll">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase hidden lg:table-cell">Sources</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase hidden xl:table-cell">Source URLs</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase hidden 2xl:table-cell">Campaigns</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Date Filter</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Created</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysers.map((analyser) => (
                        <tr key={analyser.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={18} className="text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{analyser.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{analyser.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {analyser.sources?.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell max-w-xs">
                            <div className="flex flex-col gap-1">
                              {analyser.source_urls?.slice(0, 2).map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-64 hover:underline" title={url}>{url}</a>
                              ))}
                              {analyser.source_urls?.length > 2 && <span className="text-xs text-gray-500">+{analyser.source_urls.length - 2} more</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden 2xl:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-48">
                              {analyser.campaigns?.slice(0, 2).map((c, i) => (
                                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full truncate max-w-20" title={c}>{c}</span>
                              ))}
                              {analyser.campaigns?.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{analyser.campaigns.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900" title={analyser.student_creation_date}>
                              {formatDateFilter(analyser.student_creation_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(analyser.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <div className="relative group">
                                <MoreVertical size={18} className="text-gray-400 cursor-pointer hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all" />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200">
                                  <button onClick={() => handleEditAnalyser(analyser)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                    <Edit3 size={16} /> Edit Profile
                                  </button>
                                  <button onClick={() => handleDeleteAnalyser(analyser)} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={16} /> Delete
                                  </button>
                                  <button onClick={() => handleForceLogout(analyser)} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                    <LogOut size={16} /> Force Logout
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1.5 rounded-lg border ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1.5 rounded-lg border ${pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1.5 rounded-lg border ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysers.map((analyser) => (
                  <div key={analyser.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User size={20} className="text-white" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{analyser.name}</h3>
                            <p className="text-sm text-gray-600 truncate max-w-48">{analyser.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div onClick={() => handleEditAnalyser(analyser)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                            <Edit3 size={16} className="text-gray-500 hover:text-blue-600" />
                          </div>
                          <div onClick={() => handleDeleteAnalyser(analyser)} className="p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                            <Trash2 size={16} className="text-red-500" />
                          </div>
                          <div onClick={() => handleForceLogout(analyser)} className="p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                            <LogOut size={16} className="text-red-500" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sources</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analyser.sources?.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Campaigns</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analyser.campaigns?.slice(0, 3).map((c, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full truncate max-w-20" title={c}>
                                {c}
                              </span>
                            ))}
                            {analyser.campaigns?.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{analyser.campaigns.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                          <span>Source URLs</span>
                          <span className="font-medium text-gray-900">
                            {analyser.source_urls?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {analyser.source_urls?.slice(0, 2).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate block hover:underline" title={url}>
                              {url}
                            </a>
                          ))}
                          {analyser.source_urls?.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{analyser.source_urls.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start justify-between text-xs text-gray-500">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">Date Filter</div>
                            <div className="text-gray-600" title={analyser.student_creation_date}>
                              {formatDateFilter(analyser.student_creation_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 mb-1">Created</div>
                            <div className="text-gray-600">{formatDate(analyser.created_at)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg border ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-lg border ${pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-4 py-2 rounded-lg border ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleSubmit}
        title="Add New Analyser"
        confirmText="Create Analyser"
        cancelText="Cancel"
        size="2xl"
        children={
          <AddEditModalContent
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            selectedAnalyser={selectedAnalyser}
            addSourceUrl={addSourceUrl}
            updateSourceUrl={updateSourceUrl}
            removeSourceUrl={removeSourceUrl}
            SOURCES_OPTIONS={options.sources}
            CAMPAIGNS_OPTIONS={options.campaigns}
          />
        }
      />

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleSubmit}
        title="Edit Analyser"
        confirmText="Update Analyser"
        cancelText="Cancel"
        size="2xl"
        children={
          <AddEditModalContent
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            selectedAnalyser={selectedAnalyser}
            addSourceUrl={addSourceUrl}
            updateSourceUrl={updateSourceUrl}
            removeSourceUrl={removeSourceUrl}
            SOURCES_OPTIONS={options.sources}
            CAMPAIGNS_OPTIONS={options.campaigns}
          />
        }
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Analyser"
        children={
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Analyser?
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              Are you sure you want to delete {selectedAnalyser?.name}? This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        icon={AlertTriangle}
        iconColor="red"
        size="md"
      />

      <Modal
        isOpen={showForceLogoutModal}
        onClose={() => setShowForceLogoutModal(false)}
        onConfirm={confirmForceLogout}
        title="Force Logout Confirmation"
        children={
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Force Logout Analyser?
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              This will immediately log out {selectedAnalyser?.name} from all sessions and devices.
              They will need to login again to access the platform.
            </p>
          </div>
        }
        confirmText="Force Logout"
        cancelText="Cancel"
        confirmColor="red"
        icon={AlertTriangle}
        iconColor="red"
        size="md"
      />
    </div>
  );
};

export default AnalyserBucket;