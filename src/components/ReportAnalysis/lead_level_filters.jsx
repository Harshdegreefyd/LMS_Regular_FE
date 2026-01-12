import React, { useEffect, useState } from "react";
import { Select, DatePicker, Button, Tag, Card } from "antd";
import { RotateCcw, Filter, X } from "lucide-react";
import { fetchAllCounsellors } from "../../network/counsellor";

const { RangePicker } = DatePicker;

const HorizontalFilter = ({ handleLeadSubfilter, statsFilter,filters, setFilters }) => {
  const [filterOptions, setFilterOptions] = useState({
    sourceOptions: statsFilter?.source || [],
    utmCampaignOptions: statsFilter?.utmCampaign || [],
    counsellors: [],
  });

 

  const [activeFilters, setActiveFilters] = useState({});

  // Fetch counsellors from API
  useEffect(() => {
    async function fetchCounsellors() {
      try {
        const res = await fetchAllCounsellors();
        if (res) {
          setFilterOptions((prev) => ({
            ...prev,
            counsellors: res,
          }));
        }
      } catch (err) {
        console.error("Error fetching counsellors:", err);
      }
    }
    fetchCounsellors();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || [],
    }));
  };

  const handleCounsellorChange = (values) => {
    const selectedCounsellors = filterOptions.counsellors.filter((c) => 
      values?.includes(c.counsellor_id)
    );
    
    setFilters((prev) => ({
      ...prev,
      counsellorId: values || [],
      counsellorNames: selectedCounsellors.map(c => c.counsellor_name),
    }));
  };

  const applyFilters = () => {
    const newActive = {};
    
    if (filters.source.length > 0) {
      newActive.source = filters.source.join(", ");
    }
    
    if (filters.utmCampaign.length > 0) {
      newActive.utmCampaign = filters.utmCampaign.join(", ");
    }
    
    if (filters.counsellorId.length > 0) {
      newActive.counsellor = filters.counsellorNames.join(", ");
    }
    
    if (filters.dateRange?.length === 2) {
      newActive.dateRange = `${filters.dateRange[0].format("YYYY-MM-DD")} to ${filters.dateRange[1].format("YYYY-MM-DD")}`;
    }
    
    setActiveFilters(newActive);

    // Query params for backend
    const params = {};
    
    if (filters.source.length > 0) {
      params.source = filters.source; // Send as array or join based on backend expectation
    }
    
    if (filters.utmCampaign.length > 0) {
      params.utm_campaign = filters.utmCampaign; // Send as array or join based on backend expectation
    }
    
    if (filters.counsellorId.length > 0) {
      params.counsellor_id = filters.counsellorId; // Send as array or join based on backend expectation
    }
    
    if (filters.dateRange?.length === 2) {
      params.created_at_start = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_at_end = filters.dateRange[1].format("YYYY-MM-DD");
    }
    
    handleLeadSubfilter(params);
  };

  const clearAll = () => {
    setFilters({
      source: [],
      utmCampaign: [],
      counsellorId: [],
      counsellorNames: [],
      dateRange: null,
    });
    setActiveFilters({});
    // Also send empty params to backend to clear filters
    handleLeadSubfilter({});
  };

  const removeActiveFilter = (key) => {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);

    const newFilters = { ...filters };
    if (key === "counsellor") {
      newFilters.counsellorId = [];
      newFilters.counsellorNames = [];
    } else if (key === "dateRange") {
      newFilters.dateRange = null;
    } else {
      newFilters[key] = [];
    }
    setFilters(newFilters);
    
    // Apply updated filters
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  return (
    <div className="w-full p-4">
      <Card title="Filters" className="shadow-md rounded-lg">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {/* Source */}
          <div>
            <label className="text-sm font-medium mb-1 block">Source</label>
            <Select
              mode="multiple"
              placeholder="Select Sources"
              value={filters.source}
              onChange={(value) => handleFilterChange("source", value)}
              allowClear
              showSearch
              maxTagCount="responsive"
              options={filterOptions.sourceOptions.map((s) => ({ value: s, label: s }))}
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {/* UTM Campaign */}
          <div>
            <label className="text-sm font-medium mb-1 block">UTM Campaign</label>
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Campaigns"
              value={filters.utmCampaign}
              onChange={(value) => handleFilterChange("utmCampaign", value)}
              allowClear
              maxTagCount="responsive"
              options={filterOptions.utmCampaignOptions.map((c) => ({ value: c, label: c }))}
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-1 block">Date Range</label>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange("dateRange", dates)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Counsellor */}
          <div>
            <label className="text-sm font-medium mb-1 block">Counsellor</label>
            <Select
              mode="multiple"
              showSearch
              placeholder="Search & Select Counsellors"
              value={filters.counsellorId}
              onChange={handleCounsellorChange}
              allowClear
              maxTagCount="responsive"
              options={filterOptions.counsellors.map((c) => ({
                value: c.counsellor_id,
                label: c.counsellor_name,
              }))}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <Button type="primary" icon={<Filter size={16} />} onClick={applyFilters}>
              Apply
            </Button>
            <Button icon={<RotateCcw size={16} />} onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <Card title="Active Filters" className="mt-4 shadow-md rounded-lg">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <Tag
                key={key}
                closable
                onClose={() => removeActiveFilter(key)}
                closeIcon={<X size={14} />}
                color="blue"
                style={{ marginBottom: '4px' }}
              >
                <strong>{key}:</strong> {value}
              </Tag>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HorizontalFilter;