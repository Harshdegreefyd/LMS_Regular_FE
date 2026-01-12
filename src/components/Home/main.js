// utils/secureCache.js
import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';

class SecureCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30 * 60 * 1000;
  }

  generateCacheKey(data) {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const hash = sha256(utf8ToBytes(dataString));
    return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  set(key, data) {
    const cacheKey = this.generateCacheKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    });
  }

  get(key) {
    const cacheKey = this.generateCacheKey(key);
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const secureCache = new SecureCache();

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  secureCache.cleanup();
}, 5 * 60 * 1000);

// hooks/useLeadsData.js
import { useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import { secureCache } from '../utils/secureCache';

export const useLeadsData = (roletosend) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [overallStats, setOverallStats] = useState(null);
  
  const abortControllerRef = useRef(null);
  const lastFetchParamsRef = useRef(null);
  
  const leadsPerPage = 10;

  const fetchLeads = useCallback(async (allFilters, page = 1, force = false) => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create cache key for the request
      const cacheKey = {
        filters: allFilters,
        page,
        limit: leadsPerPage,
        endpoint: '/student'
      };
      
      // Check cache first (unless forced)
      if (!force) {
        const cachedData = secureCache.get(cacheKey);
        if (cachedData) {
          setLeads(cachedData.data);
          setTotalLeads(cachedData.pagination.totalRecords);
          setTotalPages(cachedData.pagination.totalPages);
          setOverallStats(cachedData.overallStats);
          setLoading(false);
          return;
        }
      }
      
      // Create fetch key for deduplication
      const fetchKey = JSON.stringify({ filters: allFilters, page });
      if (!force && fetchKey === lastFetchParamsRef.current) {
        return;
      }
      
      lastFetchParamsRef.current = fetchKey;
      abortControllerRef.current = new AbortController();
      setLoading(true);
      
      // Clean filters
      const cleanFilters = Object.entries(allFilters).reduce((acc, [key, value]) => {
        if (value && value !== "" && value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            const filteredArray = value.filter(item => item !== "" && item !== null && item !== undefined);
            if (filteredArray.length > 0) {
              acc[key] = filteredArray;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});
      
      const params = {
        page,
        limit: leadsPerPage,
        ...cleanFilters
      };
      
      // Override for role-based filtering
      if (roletosend?.role === "l2" || roletosend?.role === "l3") {
        params.selectedagent = roletosend._id;
        params.data = roletosend.role;
      }
      
      
      const response = await axios.get(`${BASE_URL}/student`, {
        params,
        signal: abortControllerRef.current.signal,
        paramsSerializer: {
          serialize: (paramsToSerialize) => {
            const searchParams = new URLSearchParams();
            Object.entries(paramsToSerialize).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                  searchParams.set(key, value.join(','));
                } else {
                  searchParams.set(key, String(value));
                }
              }
            });
            return searchParams.toString();
          }
        }
      });
      
      if (response.data.success) {
        // Cache the response
        secureCache.set(cacheKey, response.data);
        
        setLeads(response.data.data);
        setTotalLeads(response.data.pagination.totalRecords);
        setTotalPages(response.data.pagination.totalPages);
        setOverallStats(response.data.overallStats);
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error("Error fetching leads:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [roletosend, leadsPerPage]);

  return {
    leads,
    loading,
    totalLeads,
    totalPages,
    overallStats,
    fetchLeads,
    leadsPerPage
  };
};

// hooks/useFilters.js
import { useState, useCallback, useMemo } from 'react';

export const useFilters = (activeRole, roletosend, agent) => {
  const [filters, setFilters] = useState({});

  const getTabAutoFilters = useCallback((tab) => {
    const autoFilters = {};
    
    switch (tab) {
      case 'fresh':
        autoFilters.leadStatus = 'Fresh';
        break;
      case 'callback':
        autoFilters[`${activeRole === 'l3' ? 'nextCallDateL3' : 'nextCallDate'}_start`] =
          new Date().toISOString().split('T')[0];
        break;
      default:
        break;
    }
    
    // Always include role-based filters
    if (roletosend?.role === "l2" || roletosend?.role === "l3") {
      autoFilters.selectedagent = roletosend.counsellor_id;
      autoFilters.data = roletosend.role;
    } else if (agent?.role) {
      autoFilters.data = agent.role;
      if (agent.counsellor_id) {
        autoFilters.selectedagent = agent.counsellor_id;
      }
    } else if (activeRole) {
      autoFilters.data = activeRole;
    }
    
    return autoFilters;
  }, [activeRole, roletosend, agent]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = { data: activeRole };
    setFilters(clearedFilters);
    return clearedFilters;
  }, [activeRole]);

  return {
    filters,
    getTabAutoFilters,
    updateFilters,
    clearFilters
  };
};

// hooks/useURLSync.js
import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useURLSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlUpdateTimeoutRef = useRef(null);

  const parseFiltersFromURL = useCallback(() => {
    const urlFilters = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (value && key !== 'sortBy' && key !== 'sortOrder' && key !== 'page') {
        const multiSelectFields = [
          'mode', 'source', 'leadStatus', 'leadSubStatus', 'callingStatus', 'subCallingStatus',
          'callingStatusL3', 'subCallingStatusL3', 'utmCampaign', 'utmSource', 'utmMedium',
          'utmKeyword', 'utmCampaignId', 'utmAdgroupId', 'utmCreativeId',
          'preferredCity', 'preferredState', 'preferredStream', 'preferredDegree',
          'preferredLevel', 'preferredSpecialization'
        ];
        
        if (multiSelectFields.includes(key)) {
          urlFilters[key] = value.includes(',') ? value.split(',').map(v => v.trim()) : [value];
        } else {
          urlFilters[key] = value;
        }
      }
    }
    
    return urlFilters;
  }, [searchParams]);

  const convertFiltersToURLParams = useCallback((filtersToConvert) => {
    const params = new URLSearchParams();
    
    Object.entries(filtersToConvert).forEach(([key, value]) => {
      if (value && value !== "" && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          const cleanValues = value.filter(item => item !== "" && item !== null && item !== undefined);
          if (cleanValues.length > 0) {
            params.set(key, cleanValues.join(','));
          }
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.set(key, value);
        } else if (typeof value === 'number') {
          params.set(key, value.toString());
        }
      }
    });
    
    return params;
  }, []);

  const updateURL = useCallback((newFilters, immediate = false) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
    
    const updateFn = () => {
      const params = convertFiltersToURLParams(newFilters);
      setSearchParams(params, { replace: true });
    };
    
    if (immediate) {
      updateFn();
    } else {
      urlUpdateTimeoutRef.current = setTimeout(updateFn, 300);
    }
  }, [convertFiltersToURLParams, setSearchParams]);

  return {
    searchParams,
    parseFiltersFromURL,
    updateURL
  };
};

// components/Header.jsx
import React, { memo } from 'react';
import { Plus, Download, ToggleLeft } from "lucide-react";

const Header = memo(({ 
  activeTab, 
  storedRole, 
  activeRole, 
  onAddLead, 
  onExport, 
  onRoleSwitch 
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case "fresh": return "Fresh Leads";
      case "callback": return "Callback Leads";
      default: return "Lead Dashboard";
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {getTitle()}
      </h1>
      <div className="flex gap-3">
        {storedRole === "Supervisor" && (
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={onAddLead}
          >
            <Plus size={16} className="mr-2" />
            Add Lead
          </button>
        )}

       {/*** <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          onClick={onExport}
        >
          <Download size={16} className="mr-2" />
          Export
        </button> */}

        {storedRole === "Supervisor" && (
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={onRoleSwitch}
          >
            <ToggleLeft size={16} className="mr-2" />
            Switch to {activeRole === "l3" ? "L2" : "L3"} (Current: {activeRole})
          </button>
        )}
      </div>
    </div>
  );
});

Header.displayName = 'Header';

// components/LeadsTable.jsx
import React, { memo } from 'react';
import TableContent from './TableContent';
import Pagination from './Pagination';

const LeadsTable = memo(({ 
  loading,
  leads,
  activeRole,
  totalPages,
  currentPage,
  leadsPerPage,
  totalLeads,
  filters,
  onPageChange,
  onConnect,
  onDisconnect,
  onWhatsApp,
  onAssignedtoL2,
  onAssignedtoL3
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-y-scroll">
        <TableContent
          loading={loading}
          leads={leads}
          activeRole={activeRole}
          handleConnect={onConnect}
          handleDisconnect={onDisconnect}
          setOpenChatModel={onWhatsApp}
          handleAssignedtoL2={onAssignedtoL2}
          handleAssignedtoL3={onAssignedtoL3}
        />

        <Pagination
          totalPages={totalPages}
          handlePageChange={onPageChange}
          currentPage={currentPage}
          leadsPerPage={leadsPerPage}
          totalLeads={totalLeads}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {leads.length} of {totalLeads} leads
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 text-blue-600">(filtered)</span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </>
  );
});

LeadsTable.displayName = 'LeadsTable';

// components/ModalsContainer.jsx
import React, { memo } from 'react';
import AddLeadModal from './AddLead';
import DisconnectedModal from './DisconnectedModal';
import ConnectedModal from './ConnectedModel';
import WatsaapChat from './WatsaapChat';
import AssignedLeadManually from './AssignedLeadManually';

const ModalsContainer = memo(({ 
  isAddLeadModalOpen,
  isDisconnectPopupOpen,
  isConnectedPopupOpen,
  isAssignedtoL2,
  isAssignedtoL3,
  openChatModal,
  selectedStudent,
  agentId,
  onCloseAddLead,
  onAddLeadSuccess,
  onCloseDisconnect,
  onCloseConnected,
  onCloseAssignedL2,
  onCloseAssignedL3,
  onCloseWhatsApp
}) => {
  return (
    <>
      <AddLeadModal
        agentID={agentId}
        isOpen={isAddLeadModalOpen}
        onClose={onCloseAddLead}
        onSuccess={onAddLeadSuccess}
      />

      {isDisconnectPopupOpen && selectedStudent && (
        <DisconnectedModal
          setIsDisconnectPopupOpen={onCloseDisconnect}
          selectedStudent={selectedStudent}
        />
      )}

      {isConnectedPopupOpen && selectedStudent && (
        <ConnectedModal
          setIsConnectedPopupOpen={onCloseConnected}
          selectedStudent={selectedStudent}
        />
      )}

      {isAssignedtoL2 && selectedStudent && (
        <AssignedLeadManually
          isAssignedtoL2={isAssignedtoL2}
          setIsAssignedtoL2={onCloseAssignedL2}
          selectedStudent={selectedStudent}
          setIsAssignedtoL3={onCloseAssignedL3}
        />
      )}

      {isAssignedtoL3 && selectedStudent && (
        <AssignedLeadManually
          isAssignedtoL3={isAssignedtoL3}
          setIsAssignedtoL3={onCloseAssignedL3}
          setIsAssignedtoL2={onCloseAssignedL2}
          selectedStudent={selectedStudent}
        />
      )}

      {openChatModal && selectedStudent && (
        <WatsaapChat
          setOpenwhatsappPopup={onCloseWhatsApp}
          student={selectedStudent}
        />
      )}
      
    </>
  );
});

ModalsContainer.displayName = 'ModalsContainer';

// Main HomePage Component
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import Sidebar from '../components/SideBar';
import { useSelector } from 'react-redux';
import { fetchAllCounsellors } from '../network/counsellor';
import StatsComponent from '../components/StatsComponent';
import StreamlinedFilters from '../components/AdvanceFilters';
import { useLeadsData } from '../hooks/useLeadsData';
import { useFilters } from '../hooks/useFilters';
import { useURLSync } from '../hooks/useURLSync';
import Header from '../components/Header';
import LeadsTable from '../components/LeadsTable';
import ModalsContainer from '../components/ModalsContainer';
import { secureCache } from '../utils/secureCache';

const HomePage = memo(() => {
  // URL and navigation
  const { searchParams, parseFiltersFromURL, updateURL } = useURLSync();
  const navigate = useNavigate();
  
  // Core state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPage, setCurrentPage] = useState(1);
  const [agents, setAgents] = useState([]);
  const [agent, setAgent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agent")) || {};
    } catch {
      return {};
    }
  });
  
  // Modal states
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isDisconnectPopupOpen, setIsDisconnectPopupOpen] = useState(false);
  const [isConnectedPopupOpen, setIsConnectedPopupOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openChatModal, setOpenChatModel] = useState(false);
  const [isAssignedtoL2, setIsAssignedtoL2] = useState(false);
  const [isAssignedtoL3, setIsAssignedtoL3] = useState(false);
  
  // Redux state
  const roletosend = useSelector((state) => state.auth.user);
  const storedRole = useSelector((state) => state.auth.role);
  
  // Memoized active role
  const activeRole = useMemo(() => {
    return agent?.role || (storedRole !== "Supervisor" ? storedRole : null) || "l2";
  }, [agent?.role, storedRole]);
  
  // Custom hooks
  const { leads, loading, totalLeads, totalPages, overallStats, fetchLeads, leadsPerPage } = useLeadsData(roletosend);
  const { filters, getTabAutoFilters, updateFilters, clearFilters } = useFilters(activeRole, roletosend, agent);
  
  // Initialize component
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();
    const pageFromURL = parseInt(searchParams.get('page') || '1', 10);
    
    updateFilters(urlFilters);
    setCurrentPage(pageFromURL);
    
    const autoFilters = getTabAutoFilters(activeTab);
    const combinedFilters = { ...autoFilters, ...urlFilters };
    
    fetchLeads(combinedFilters, pageFromURL, true);
  }, []); // Only run once on mount
  
  // Fetch agents for supervisor
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetchAllCounsellors();
      setAgents(response || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }, []);
  
  useEffect(() => {
    if (storedRole === "Supervisor") {
      fetchAgents();
    }
  }, [storedRole, fetchAgents]);
  
  // Event handlers
  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    setCurrentPage(1);
    
    const autoFilters = getTabAutoFilters(tab);
    updateFilters(autoFilters);
    fetchLeads(autoFilters, 1, true);
    updateURL(autoFilters, true);
  }, [activeTab, getTabAutoFilters, updateFilters, fetchLeads, updateURL]);
  
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = key === 'bulk' ? 
      { ...value, data: value.data || filters.data || activeRole } :
      { ...filters, [key]: value, data: filters.data || activeRole };
    
    updateFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters);
    fetchLeads(newFilters, 1, true);
  }, [filters, activeRole, updateFilters, updateURL, fetchLeads]);
  
  const handleApplyFilters = useCallback((newFilters) => {
    const filtersWithData = {
      ...newFilters,
      data: newFilters.data || filters.data || activeRole
    };
    
    updateFilters(filtersWithData);
    setCurrentPage(1);
    updateURL(filtersWithData, true);
    fetchLeads(filtersWithData, 1, true);
  }, [filters, activeRole, updateFilters, updateURL, fetchLeads]);
  
  const handleClearFilters = useCallback(() => {
    const clearedFilters = clearFilters();
    setCurrentPage(1);
    updateURL(clearedFilters, true);
    fetchLeads(clearedFilters, 1, true);
  }, [clearFilters, updateURL, fetchLeads]);
  
  const handleAgentClick = useCallback((selectedAgent) => {
    try {
      localStorage.setItem("agent", JSON.stringify(selectedAgent));
      setAgent(selectedAgent);
      
      const updatedFilters = {
        ...filters,
        selectedagent: selectedAgent.counsellor_id,
        data: selectedAgent.role || activeRole
      };
      
      updateFilters(updatedFilters);
      setCurrentPage(1);
      updateURL(updatedFilters, true);
      fetchLeads(updatedFilters, 1, true);
      
      // Clear cache when agent changes
      secureCache.clear();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  }, [filters, activeRole, updateFilters, updateURL, fetchLeads]);
  
  const handleRoleSwitch = useCallback(() => {
    const newRole = activeRole === "l3" ? "l2" : "l3";
    const updatedAgent = { ...agent, role: newRole };
    
    try {
      localStorage.setItem("agent", JSON.stringify(updatedAgent));
      setAgent(updatedAgent);
      
      const updatedFilters = {
        ...filters,
        data: newRole,
        selectedagent: updatedAgent.counsellor_id || agent.counsellor_id || roletosend?.counsellor_id
      };
      
      updateFilters(updatedFilters);
      setCurrentPage(1);
      updateURL(updatedFilters, true);
      fetchLeads(updatedFilters, 1, true);
      
      // Clear cache when role switches
      secureCache.clear();
    } catch (error) {
      console.error("Error switching roles:", error);
    }
  }, [activeRole, agent, filters, roletosend, updateFilters, updateURL, fetchLeads]);
  
  const handlePageChange = useCallback((newPage) => {
    if (newPage === currentPage) return;
    
    setCurrentPage(newPage);
    fetchLeads(filters, newPage, true);
  }, [currentPage, filters, fetchLeads]);
  
  const handleExportLeads = useCallback(async () => {
    try {
      const autoFilters = getTabAutoFilters(activeTab);
      const allFilters = {
        ...autoFilters,
        ...filters,
        data: filters.data || autoFilters.data || activeRole
      };
      
      const cleanFilters = Object.entries(allFilters).reduce((acc, [key, value]) => {
        if (value && value !== "" && value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            const filteredArray = value.filter(item => item !== "" && item !== null && item !== undefined);
            if (filteredArray.length > 0) {
              acc[key] = filteredArray;
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});
      
      const response = await axios.get(`${BASE_URL}/student/export`, {
        params: { ...cleanFilters, export: true },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting leads:", error);
    }
  }, [activeTab, filters, activeRole, getTabAutoFilters]);
  
  // Modal handlers
  const modalHandlers = useMemo(() => ({
    handleConnect: (student) => {
      setIsConnectedPopupOpen(true);
      setSelectedStudent(student);
    },
    handleDisconnect: (student) => {
      setIsDisconnectPopupOpen(true);
      setSelectedStudent(student);
    },
    handleAssignedtoL2: (student) => {
      setSelectedStudent(student);
      setIsAssignedtoL2(true);
    },
    handleAssignedtoL3: (student) => {
      setSelectedStudent(student);
      setIsAssignedtoL3(true);
    },
    handleWhatsApp: (leadData) => {
      setSelectedStudent(leadData);
      setOpenChatModel(true);
    },
    handleAddLeadSuccess: () => {
      setIsAddLeadModalOpen(false);
      fetchLeads(filters, currentPage, true);
    }
  }), [filters, currentPage, fetchLeads]);

  return (
    <div className="flex bg-gray-50">
      <Sidebar
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarCollapsed={sidebarCollapsed}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        agents={agents}
        handleAgentClick={handleAgentClick}
        navigate={navigate}
      />

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <main className="p-6 bg-white">
          <Header
            activeTab={activeTab}
            storedRole={storedRole}
            activeRole={activeRole}
            onAddLead={() => setIsAddLeadModalOpen(true)}
            onExport={handleExportLeads}
            onRoleSwitch={handleRoleSwitch}
          />

          {activeTab === "dashboard" && (
            <StatsComponent 
              overallStats={overallStats} 
              filters={filters} 
              activeRole={activeRole} 
            />
          )}

          <div className="mb-6">
            <StreamlinedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              loading={loading}
            />
          </div>

          <LeadsTable
            loading={loading}
            leads={leads}
            activeRole={activeRole}
            totalPages={totalPages}
            currentPage={currentPage}
            leadsPerPage={leadsPerPage}
            totalLeads={totalLeads}
            filters={filters}
            onPageChange={handlePageChange}
            onConnect={modalHandlers.handleConnect}
            onDisconnect={modalHandlers.handleDisconnect}
            onWhatsApp={modalHandlers.handleWhatsApp}
            onAssignedtoL2={modalHandlers.handleAssignedtoL2}
            onAssignedtoL3={modalHandlers.handleAssignedtoL3}
          />

          <ModalsContainer
            isAddLeadModalOpen={isAddLeadModalOpen}
            isDisconnectPopupOpen={isDisconnectPopupOpen}
            isConnectedPopupOpen={isConnectedPopupOpen}
            isAssignedtoL2={isAssignedtoL2}
            isAssignedtoL3={isAssignedtoL3}
            openChatModal={openChatModal}
            selectedStudent={selectedStudent}
            agentId={agent?.counsellor_id}
            onCloseAddLead={() => setIsAddLeadModalOpen(false)}
            onAddLeadSuccess={modalHandlers.handleAddLeadSuccess}
            onCloseDisconnect={() => setIsDisconnectPopupOpen(false)}
            onCloseConnected={() => setIsConnectedPopupOpen(false)}
            onCloseAssignedL2={() => setIsAssignedtoL2(false)}
            onCloseAssignedL3={() => setIsAssignedtoL3(false)}
            onCloseWhatsApp={() => setOpenChatModel(false)}
          />
        </main>
      </div>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;