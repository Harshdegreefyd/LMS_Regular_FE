import React from 'react';
import { Edit3, Copy, Trash2, Power, Info, Calendar, BarChart } from 'lucide-react';
import Tooltip from './Tooltip';

const RuleList = ({ rules, onEditRule, onDuplicateRule, onDeleteRule, onToggleRule }) => {

  const handleEditRule = (rule) => {
    onEditRule(rule);
  };

  const handleDuplicateRule = (rule) => {
    onDuplicateRule(rule);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupConditions = (conditions) => {
    const groups = {
      'Source': ['mode', 'source', 'first_source_url', 'utm_campaign'],
      'Education': ['stream', 'level', 'degree', 'preferred_level', 'preferred_degree', 'preferred_specialization'],
      'Location': ['pref_state', 'pref_city', 'preferred_state'],
      'Career': ['preferred_budget', 'current_profession']
    };

    const result = {};
    Object.entries(groups).forEach(([groupName, fields]) => {
      const groupConditions = {};
      fields.forEach(field => {
        if (conditions[field] && Array.isArray(conditions[field]) && conditions[field].length > 0) {
          groupConditions[field] = conditions[field];
        }
      });
      if (Object.keys(groupConditions).length > 0) {
        result[groupName] = groupConditions;
      }
    });

    return result;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Existing Rules ({rules.length})
      </h2>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {rules.map((rule) => {
          const conditionGroups = groupConditions(rule.conditions || {});
          
          return (
            <div key={rule.lead_assignment_rule_l2_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Tooltip text={rule.name}>
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {rule.name}
                      </h3>
                    </Tooltip>
                    <span className="text-xs text-gray-500">#{rule.lead_assignment_rule_l2_id}</span>
                  </div>
                  
                  {rule.custom_rule_name?.trim() && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Custom Name:</strong> {rule.custom_rule_name}
                    </p>
                  )}
                  
                  {rule.description?.trim() && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {rule.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <Tooltip text="Toggle Status">
                      <Power
                        size={14}
                        className={`cursor-pointer ${rule.is_active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                        onClick={() => onToggleRule(rule.lead_assignment_rule_l2_id)}
                      />
                    </Tooltip>
                    <Tooltip text="Edit Rule">
                      <Edit3
                        size={14}
                        className="text-gray-400 hover:text-blue-600 cursor-pointer"
                        onClick={() => handleEditRule(rule)}
                      />
                    </Tooltip>
                    <Tooltip text="Duplicate Rule">
                      <Copy
                        size={14}
                        className="text-gray-400 hover:text-yellow-600 cursor-pointer"
                        onClick={() => handleDuplicateRule(rule)}
                      />
                    </Tooltip>
                    <Tooltip text="Delete Rule">
                      <Trash2
                        size={14}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                        onClick={() => onDeleteRule(rule.lead_assignment_rule_l2_id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>

              {Object.keys(conditionGroups).length > 0 && (
                <div className="mb-3">
                  {Object.entries(conditionGroups).map(([groupName, fields]) => (
                    <div key={groupName} className="mb-2">
                      <span className="text-xs font-semibold text-gray-600">{groupName}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(fields).map(([field, values]) => (
                          values.map(value => (
                            <Tooltip key={`${field}-${value}`} text={`${field}: ${value}`}>
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs inline-block max-w-[200px] truncate">
                                {field}: {value}
                              </span>
                            </Tooltip>
                          ))
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <BarChart size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {rule.total_matched_leads || 0} leads
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">
                        Last: {formatDate(rule.last_matched_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600">Agents:</span>
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {rule.counsellors?.map((agent) => (
                        <Tooltip key={agent?.counsellor_id} text={agent?.counsellor_name}>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[100px] inline-block">
                            {agent?.counsellor_name || 'Loading...'}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default RuleList;