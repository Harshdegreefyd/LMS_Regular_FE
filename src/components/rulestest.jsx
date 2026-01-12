import React, { useEffect, useState } from 'react';
import { Edit3, Copy, Trash2, Power } from 'lucide-react';
import Tooltip from './Tooltip';
import { getCounsellorById } from '../network/counsellor';

const RuleList = ({ rules, onEditRule, onDuplicateRule, onDeleteRule, onToggleRule }) => {
  const [counsellorNames, setCounsellorNames] = useState({});

  const fetchCounsellorName = async (counsellorId) => {
    if (counsellorNames[counsellorId]) return;
    try {
      const response = await getCounsellorById(counsellorId);
      setCounsellorNames(prev => ({ ...prev, [counsellorId]: response.name || 'Unknown' }));
    } catch {
      setCounsellorNames(prev => ({ ...prev, [counsellorId]: 'Unknown' }));
    }
  };

  useEffect(() => {
    const ids = new Set();
    rules.forEach(rule => {
      rule.assignedCounsellors?.forEach(id => {
        if (!counsellorNames[id]) ids.add(id);
      });
    });
    ids.forEach(id => fetchCounsellorName(id));
    
  }, [rules]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Existing Rules ({rules.length})
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rules.map((rule) => (
          <div key={rule._id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <Tooltip text={rule.name}>
                <h3 className="text-base font-medium text-gray-900 truncate max-w-[200px]">
                  {rule.name}
                </h3>
              </Tooltip>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
                <Tooltip text="Toggle Status">
                  <Power
                    size={14}
                    className={`cursor-pointer ${rule.isActive ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    onClick={() => onToggleRule(rule._id)}
                  />
                </Tooltip>
                <Tooltip text="Edit Rule">
                  <Edit3
                    size={14}
                    className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => onEditRule(rule)}
                  />
                </Tooltip>
                <Tooltip text="Duplicate Rule">
                  <Copy
                    size={14}
                    className="text-gray-400 hover:text-yellow-600 cursor-pointer"
                    onClick={() => onDuplicateRule(rule)}
                  />
                </Tooltip>
                <Tooltip text="Delete Rule">
                  <Trash2
                    size={14}
                    className="text-gray-400 hover:text-red-600 cursor-pointer"
                    onClick={() => onDeleteRule(rule._id)}
                  />
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              {Object.entries(rule.conditions).map(([key, value]) => {
                if (!Array.isArray(value) || value.length === 0) return null;

                return (
                  <div key={key} className="flex items-center space-x-1 min-w-0">
                    <span className="font-medium text-gray-600 capitalize flex-shrink-0">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {value.map(v => (
                        <Tooltip key={v} text={v}>
                          <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs inline-block max-w-[160px] truncate">
                            {key === 'firstSourceUrl' ? v.slice(0, 50) + (v.length > 50 ? '...' : '') : v}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600 flex-shrink-0">L2 Agent(s):</span>
                <div className="flex flex-wrap gap-1 min-w-0">
                  {rule.assignedCounsellors?.map(agentId => (
                    <Tooltip key={agentId} text={counsellorNames[agentId]}>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[100px] inline-block">
                        {counsellorNames[agentId] || 'Loading...'}
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 text-sm">Round Robin Assignment</h4>
            <p className="text-yellow-700 text-xs mt-1">
              When multiple agents are assigned to a rule, leads will be distributed using round-robin rotation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleList;
