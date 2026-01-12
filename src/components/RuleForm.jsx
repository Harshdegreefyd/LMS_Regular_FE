import React from 'react';
import MultiSelect from './MultiSelect';

const RuleForm = ({
  rule,
  options,
  submitting,
  isEditing,
  onRuleChange
}) => {
  const handleConditionChange = (field, value) => {
    onRuleChange(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  const handleCounsellorChange = (value) => {
    onRuleChange(prev => ({
      ...prev,
      assigned_counsellor_ids: value
    }));
  };

  const fieldDisplayNames = {
    utmCampaign: 'UTM Campaign',
    first_source_url: 'Domain URLs (one per line)',
    source: 'Source',
    mode: 'Mode',
    preferred_budget: 'Budget Range (₹)',
    current_profession: 'Current Profession',
    preferred_level: 'Preferred Level',
    preferred_degree: 'Preferred Degree',
    preferred_specialization: 'Preferred Specialization',
    preferred_city: 'Preferred City',
    preferred_state: 'Preferred State'
  };

  const fieldGroups = [
    ['first_source_url','utmCampaign', 'source', 'mode'],
    ['preferred_state', 'preferred_city'],
    ['preferred_degree', 'preferred_specialization', 'preferred_level'],
    ['preferred_budget', 'current_profession']
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rule Name *
        </label>
        <input
          type="text"
          value={rule?.custom_rule_name || ''}
          onChange={(e) =>
            onRuleChange(prev => ({
              ...prev,
              custom_rule_name: e.target.value
            }))
          }
          placeholder="Enter rule name (e.g., High Budget Bachelors)"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-6">
        {fieldGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fieldDisplayNames[field] || field}
                </label>
                {field === 'first_source_url' ? (
                  <textarea
                    value={rule.conditions[field] || ''}
                    onChange={(e) => handleConditionChange(field, e.target.value)}
                    placeholder="example.com&#10;test.com&#10;demo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-blue-500 resize-none"
                    rows={3}
                  />
                ) : (
                  <MultiSelect
                    options={options[field] || ['Any']}
                    value={rule.conditions[field] || []}
                    onChange={(val) => handleConditionChange(field, val)}
                    placeholder={`Select ${fieldDisplayNames[field] || field}`}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Counsellors *
        </label>
        <MultiSelect
          options={options.counsellors}
          value={rule.assigned_counsellor_ids}
          onChange={handleCounsellorChange}
          placeholder="Select counsellor(s)"
        />
        <p className="text-xs text-gray-500 mt-2">
          Leads matching this rule will be assigned to selected counsellors using round-robin
        </p>
      </div>
    </div>
  );
};

export default RuleForm;