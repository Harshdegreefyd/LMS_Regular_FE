import { useState, useCallback, useMemo } from 'react';

export const useFilters = (activeRole, roletosend, agent) => {
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard'); // Add activeTab state


  const getTabAutoFilters = useCallback((tab) => {
    const autoFilters = {};

    switch (tab) {
      case 'dashboard':
        autoFilters.dashboard = true;
        break;
      case 'fresh':
        autoFilters.freshLeads = 'Fresh';
        break;
      case 'callback':
        autoFilters.callback = 'combined';
        break;
      case 'wishlist':
        autoFilters.wishlist = true;
        break;
      default:
        break;
    }

    if (roletosend?.role === "l2" || roletosend?.role === "l3") {
      autoFilters.selectedagent = roletosend.counsellor_id || agent?.id;
      autoFilters.data = roletosend.role;
    } else if (agent?.role) {
      autoFilters.data = agent.role;
      if (agent.counsellor_id || agent?.id) {
        autoFilters.selectedagent = agent?.id || agent.counsellor_id;
      }
    } else if (activeRole) {
      autoFilters.data = activeRole;
    }

    return autoFilters;
  }, [activeRole, roletosend, agent]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Updated clearFilters to preserve tab-specific filters
  const clearFilters = useCallback((currentTab = 'dashboard') => {
    // Get the auto filters for the current tab
    const tabAutoFilters = getTabAutoFilters(currentTab);

    // Clear all filters but keep the tab-specific ones
    const clearedFilters = {
      data: activeRole,
      ...tabAutoFilters
    };

    setFilters(clearedFilters);
    return clearedFilters;
  }, [activeRole, getTabAutoFilters]);

  // Add a method to update active tab
  const setCurrentTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return {
    filters,
    getTabAutoFilters,
    updateFilters,
    clearFilters,
    setCurrentTab
  };
};