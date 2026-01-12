import React, { useState } from 'react';
import { Edit3, Copy, Trash2, Power, Users, Calendar } from 'lucide-react';
import Tooltip from './Tooltip';

const RuleCards = ({ rules, onEditRule, onDeleteRule, onToggleRule, onDuplicateRule }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpand = (ruleId) => {
    setExpandedCard(expandedCard === ruleId ? null : ruleId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getConditionCount = (conditions) => {
    return Object.values(conditions || {}).filter(val => 
      Array.isArray(val) && val.length > 0
    ).length;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const conditionCount = getConditionCount(rule.conditions);
          const isExpanded = expandedCard === rule.lead_assignment_rule_l2_id;
          
          return (
            <div key={rule.lead_assignment_rule_l2_id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {rule.custom_rule_name || rule.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">ID: {rule.lead_assignment_rule_l2_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tooltip text="Toggle Status">
                      <button
                        onClick={() => onToggleRule(rule.lead_assignment_rule_l2_id)}
                        className={`p-1 rounded ${rule.is_active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                      >
                        <Power size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip text="Edit">
                      <button
                        onClick={() => onEditRule(rule)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded"
                      >
                        <Edit3 size={16} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{rule.counsellors?.length || 0} agents</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatDate(rule.updated_at)}</span>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {conditionCount} conditions
                  </span>
                </div>
              </div>

              {/* Card Body - Summary */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Key Conditions Summary */}
                  {Object.entries(rule.conditions || {}).slice(0, 3).map(([key, value]) => {
                    if (!Array.isArray(value) || value.length === 0) return null;
                    
                    const displayNames = {
                      preferred_degree: 'Degree',
                      preferred_specialization: 'Specialization',
                      preferred_budget: 'Budget',
                      preferred_state: 'State'
                    };
                    
                    if (!displayNames[key]) return null;
                    
                    return (
                      <div key={key} className="flex items-start">
                        <div className="w-24 text-xs text-gray-500 font-medium">
                          {displayNames[key]}:
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1">
                            {value.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {item}
                              </span>
                            ))}
                            {value.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{value.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Expand/Collapse Button */}
                {conditionCount > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleExpand(rule.lead_assignment_rule_l2_id)}
                      className="text-sm text-blue-600 hover:text-blue-800 w-full flex items-center justify-center"
                    >
                      {isExpanded ? 'Show Less' : 'Show All Conditions'}
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Conditions */}
              {isExpanded && conditionCount > 0 && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">All Conditions</h4>
                    <div className="space-y-3">
                      {Object.entries(rule.conditions || {}).map(([key, value]) => {
                        if (!Array.isArray(value) || value.length === 0) return null;
                        
                        const displayNames = {
                          utmCampaign: 'UTM Campaign',
                          first_source_url: 'Domain URLs',
                          source: 'Source',
                          mode: 'Mode',
                          preferred_budget: 'Budget Range',
                          current_profession: 'Profession',
                          preferred_level: 'Level',
                          preferred_degree: 'Degree',
                          preferred_specialization: 'Specialization',
                          preferred_city: 'City',
                          preferred_state: 'State'
                        };
                        
                        return (
                          <div key={key} className="text-sm">
                            <div className="font-medium text-gray-600 mb-1">
                              {displayNames[key] || key}:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {key === 'first_source_url' ? (
                                <div className="space-y-1">
                                  {value.map((url, idx) => (
                                    <div key={idx} className="text-gray-700 text-xs bg-white p-2 rounded border">
                                      {url}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                value.map((item, idx) => (
                                  <span key={idx} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border">
                                    {item}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {rule.counsellors?.slice(0, 2).map((agent) => (
                      <Tooltip key={agent.counsellor_id} text={agent.counsellor_name}>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {agent.counsellor_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    ))}
                    {rule.counsellors?.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{rule.counsellors.length - 2} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tooltip text="Duplicate">
                      <button
                        onClick={() => onDuplicateRule(rule)}
                        className="text-gray-400 hover:text-yellow-600"
                      >
                        <Copy size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip text="Delete">
                      <button
                        onClick={() => onDeleteRule(rule.lead_assignment_rule_l2_id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {rules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No rules configured</div>
          <div className="text-gray-500 text-sm">Click "New Rule" to create your first rule</div>
        </div>
      )}
    </div>
  );
};

export default RuleCards;