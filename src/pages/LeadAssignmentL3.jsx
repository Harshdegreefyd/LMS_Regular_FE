import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Users, Edit3, ToggleLeft, ToggleRight, X, Search } from 'lucide-react';
import { BASE_URL } from '../config/api';
import axios from 'axios';

// Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder, searchable = true, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (option) => {
        if (disabled) return;
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const removeOption = (option) => {
        if (disabled) return;
        onChange(selected.filter(item => item !== option));
    };

    return (
        <div className="relative">
            <div className={`w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 min-h-[38px] cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}>
                <div className="flex flex-wrap gap-1">
                    {selected.map(item => (
                        <span key={item} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {item}
                            <X className="w-3 h-3 cursor-pointer hover:bg-blue-200 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeOption(item);
                                }} />
                        </span>
                    ))}
                    {selected.length === 0 && (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                    {searchable && (
                        <div className="p-2 border-b">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.map(option => (
                            <div
                                key={option}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => toggleOption(option)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={() => { }}
                                    className="pointer-events-none"
                                />
                                <span className="text-sm">{option}</span>
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const LeadAssignmentL3 = () => {

    const [dropdownData, setDropdownData] = useState({
        universities: [],
        streams: [],
        degrees: [],
        specializations: [],
        levels: [],
        cities: [],
        states: [],
        studyModes: [],
        courses: []
    });

    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ruleSets, setRuleSets] = useState([]);
    const [editingRule, setEditingRule] = useState(null);

    const [currentRule, setCurrentRule] = useState({
        college: '',
        university_name: [],
        course: {
            stream: [],
            degree: [],
            specialization: [],
            level: [],
            courseName: []
        },
        source: [],
        assigned_counsellor_ids: [],
        is_active: true,
        custom_rule_name: ''
    });

    const [sources, setSources] = useState([]);

    const fetchSources = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/filterOption`, {
                withCredentials: true
            });

            setSources(response?.data?.data?.source || []);
        } catch (err) {
            console.log("Error fetching sources:", err);
        }
    };

    useEffect(() => {
        fetchInitialData();
        fetchAgents();
        fetchRuleSets();
        fetchSources();
    }, []);

    // Fetch initial university data
    const fetchInitialData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/universitycourse/dropdown`);
            const Jsondata = await response.json();
            
            console.log('Initial Dropdown Data:', Jsondata);
            const {data,success}=Jsondata;
            if (success) {
                console.log('Dropdown Data:', data);
               
             setDropdownData(data);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchFilteredData = async (filters) => {
        try {
            console.log('Fetching filtered data with filters:', filters);
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key].length > 0) {
                    filters[key].forEach(value => queryParams.append(key, value));
                }
            });

            const response = await fetch(`${BASE_URL}/university/dropdown-data?${queryParams}`);
            const data = await response.json();
            if (data.success) {
                setDropdownData(data.data);
            }
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        }
    };

   const fetchAgents = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/counsellor/getAllCounsellors?role=l3`,
      { withCredentials: true } 
    );

    setAgents(response?.data || []);
  } catch (error) {
    console.error('Error fetching agents:', error);
  }
};

    const fetchRuleSets = async () => {
        try {
            const response = await fetch(`${BASE_URL}/leadassignmentl3`);
            const data = await response.json();
            setRuleSets(data);
        } catch (error) {
            console.error('Error fetching rulesets:', error);
        }
    };

    const handleUniversityChange = (value) => {
        // Reset dependent fields when university changes
        setCurrentRule(prev => ({
            ...prev,
            university_name: value,
            course: {
                stream: [],
                degree: [],
                specialization: [],
                level: [],
                courseName: []
            }
        }));

        // Fetch filtered data for the selected universities
        if (value.length > 0) {
            fetchFilteredData({ universityName: value });
        } else {
            fetchInitialData();
        }
    };

    const handleCourseChange = (field, value) => {
        let updatedCourse = { ...currentRule.course };
        updatedCourse[field] = value;

        // Reset dependent fields when parent field changes
        if (field === 'stream') {
            updatedCourse.specialization = [];
            updatedCourse.degree = [];
            updatedCourse.courseName = [];
        } else if (field === 'specialization') {
            updatedCourse.degree = [];
            updatedCourse.courseName = [];
        } else if (field === 'degree') {
            updatedCourse.courseName = [];
        }
        // Removed the level reset condition

        setCurrentRule(prev => ({
            ...prev,
            course: updatedCourse
        }));

        // Prepare filters for API call
        const filters = {
            universityName: currentRule.university_name,
            stream: field === 'stream' ? value : updatedCourse.stream,
            specialization: field === 'specialization' ? value : updatedCourse.specialization,
            degreeName: field === 'degree' ? value : updatedCourse.degree,
            level: field === 'level' ? value : updatedCourse.level
        };

        // Fetch filtered data
        fetchFilteredData(filters);
    };

    const handleAgentSelection = (agentId) => {
        setCurrentRule(prev => ({
            ...prev,
            assigned_counsellor_ids: prev.assigned_counsellor_ids.includes(agentId)
                ? prev.assigned_counsellor_ids.filter(id => id !== agentId)
                : [...prev.assigned_counsellor_ids, agentId]
        }));
    };

    const handleSaveRule = async () => {
        if (currentRule.assigned_counsellor_ids.length === 0) {
            alert('Please select at least one agent');
            return;
        }

        setLoading(true);
        try {
            const url = editingRule ? `${BASE_URL}/leadassignmentl3/${editingRule}` : `${BASE_URL}/leadassignmentl3`;
            const method = editingRule ? 'PUT' : 'POST';

            // Prepare payload with snake_case keys to match backend expectations
            const payload = {
                college: currentRule.college,
                university_name: currentRule.university_name,
                course_conditions: {
                    stream: currentRule.course.stream,
                    degree: currentRule.course.degree,
                    specialization: currentRule.course.specialization,
                    level: currentRule.course.level,
                    courseName: currentRule.course.courseName
                },
                source: currentRule.source,
                assigned_counsellor_ids: currentRule.assigned_counsellor_ids,
                is_active: currentRule.is_active,
                custom_rule_name: currentRule?.custom_rule_name.trim() || ''
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchRuleSets();
                resetForm();
                alert(`Rule ${editingRule ? 'updated' : 'saved'} successfully!`);
            } else {
                alert(`Error ${editingRule ? 'updating' : 'saving'} rule`);
            }
        } catch (error) {
            console.error(`Error ${editingRule ? 'updating' : 'saving'} rule:`, error);
            alert(`Error ${editingRule ? 'updating' : 'saving'} rule`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRule = (rule) => {
        setCurrentRule({
            college: rule.college || '',
            custom_rule_name: rule.custom_rule_name || '',
            university_name: Array.isArray(rule.university_name) ? rule.university_name : (rule.university_name ? [rule.university_name] : []),
            course: {
                stream: Array.isArray(rule.course_conditions?.stream) ? rule.course_conditions.stream : (rule.course_conditions?.stream ? [rule.course_conditions.stream] : []),
                degree: Array.isArray(rule.course_conditions?.degree) ? rule.course_conditions.degree : (rule.course_conditions?.degree ? [rule.course_conditions.degree] : []),
                specialization: Array.isArray(rule.course_conditions?.specialization) ? rule.course_conditions.specialization : (rule.course_conditions?.specialization ? [rule.course_conditions.specialization] : []),
                level: Array.isArray(rule.course_conditions?.level) ? rule.course_conditions.level : (rule.course_conditions?.level ? [rule.course_conditions.level] : []),
                courseName: Array.isArray(rule.course_conditions?.courseName) ? rule.course_conditions.courseName : (rule.course_conditions?.courseName ? [rule.course_conditions.courseName] : [])
            },
            source: Array.isArray(rule.source) ? rule.source : (rule.source ? [rule.source] : []),
            assigned_counsellor_ids: rule.assigned_counsellor_ids?.map(agent => typeof agent === 'object' ? agent.counsellor_id : agent) || [],
            is_active: rule.is_active
        });
        setEditingRule(rule.l3_assignment_rulesets_id);
    };

    const handleToggleRule = async (ruleId) => {
        try {
            const response = await fetch(`${BASE_URL}/leadassignmentl3/${ruleId}/toggle`, {
                method: 'PATCH'
            });

            if (response.ok) {
                fetchRuleSets();
                alert('Rule status updated successfully!');
            } else {
                alert('Error updating rule status');
            }
        } catch (error) {
            console.error('Error toggling rule:', error);
            alert('Error updating rule status');
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            try {
                const response = await fetch(`${BASE_URL}/leadassignmentl3/${ruleId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchRuleSets();
                    alert('Rule deleted successfully!');
                } else {
                    alert('Error deleting rule');
                }
            } catch (error) {
                console.error('Error deleting rule:', error);
                alert('Error deleting rule');
            }
        }
    };

    const resetForm = () => {
        setCurrentRule({
            college: '',
            university_name: [],
            course: {
                stream: [],
                degree: [],
                specialization: [],
                level: [],
                courseName: []
            },
            source: [],
            assigned_counsellor_ids: [],
            is_active: true
        });
        setEditingRule(null);
        fetchInitialData(); // Reset dropdown data
    };

    const formatArrayDisplay = (arr) => {
        if (!arr || arr.length === 0) return 'Any';
        return arr.join(', ');
    };
    console.log('Dropdown Data State: final', dropdownData);
    return (
        <div className="min-h-screen bg-gray-50 p-6 px-10">
            <div className=" mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">L3 Lead Assignment</h1>
                    <p className="text-gray-600">Configure rules for transferring leads from L2 to L3 agents</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 min-h-[50rem]  overflow-hidden">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {editingRule ? 'Edit Rule' : 'Create New Rule'}
                            </h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Rule Name</label>
                                <input
                                    type="text"
                                    value={currentRule.custom_rule_name}
                                    onChange={(e) => setCurrentRule({ ...currentRule, custom_rule_name: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="Enter Custom Rule Name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                                <MultiSelectDropdown
                                    options={dropdownData.universities || dropdownData?.university_name || []}
                                    selected={currentRule.university_name}
                                    onChange={handleUniversityChange}
                                    placeholder="Select Universities"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Criteria</label>

                                <div className="space-y-2">
                                    <MultiSelectDropdown
                                        options={dropdownData.streams || []}
                                        selected={currentRule.course.stream}
                                        onChange={(value) => handleCourseChange('stream', value)}
                                        placeholder="Select Streams"
                                    />

                                    <MultiSelectDropdown
                                        options={dropdownData.specializations || []}
                                        selected={currentRule.course.specialization}
                                        onChange={(value) => handleCourseChange('specialization', value)}
                                        placeholder="Select Specializations"
                                    />

                                    <MultiSelectDropdown
                                        options={dropdownData.degrees || []}
                                        selected={currentRule.course.degree}
                                        onChange={(value) => handleCourseChange('degree', value)}
                                        placeholder="Select Degrees"
                                    />

                                    <MultiSelectDropdown
                                        options={dropdownData.levels || []}
                                        selected={currentRule.course.level}
                                        onChange={(value) => handleCourseChange('level', value)}
                                        placeholder="Select Levels"
                                    />

                                    <MultiSelectDropdown
                                        options={dropdownData.courses || []}
                                        selected={currentRule.course.courseName}
                                        onChange={(value) => handleCourseChange('courseName', value)}
                                        placeholder="Select Course Names"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Source
                                </label>
                                <MultiSelectDropdown
                                    options={sources}
                                    selected={currentRule.source}
                                    onChange={(value) => setCurrentRule(prev => ({ ...prev, source: value }))}
                                    placeholder="Select Sources"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign to L3 Agents
                                </label>
                                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {agents?.map((agent) => (
                                        <label key={agent.counsellor_id} className="flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                checked={currentRule.assigned_counsellor_ids.includes(agent.counsellor_id)}
                                                onChange={() => handleAgentSelection(agent.counsellor_id)}
                                                className="mr-3"
                                            />
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="text-sm">{agent.counsellor_name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {currentRule.assigned_counsellor_ids.length > 1 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Multiple agents selected - Round robin will be applied
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveRule}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Save Rule')}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    {editingRule ? 'Cancel' : 'Reset'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 min-h-[50rem] h-auto overflow-scroll">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Rules ({ruleSets.length})</h2>

                            {ruleSets.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p>No rules created yet. Create your first rule using the form.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ruleSets.map((rule) => (
                                        <div key={rule.l3_assignment_rulesets_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                                                <h3 className="text-lg font-medium text-gray-900">Custom Rule Name :{rule?.custom_rule_name?.trim() ? rule.custom_rule_name : 'N/A'}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {rule.is_active ? 'Active' : 'Inactive'}
                                                    </span>

                                                    <button
                                                        onClick={() => handleEditRule(rule)}
                                                        className="text-blue-500 hover:text-blue-700 p-1"
                                                        title="Edit Rule"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleRule(rule.l3_assignment_rulesets_id)}
                                                        className="text-yellow-500 hover:text-yellow-700 p-1"
                                                        title={rule.is_active ? 'Deactivate Rule' : 'Activate Rule'}
                                                    >
                                                        {rule.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRule(rule.l3_assignment_rulesets_id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Delete Rule"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">College:</span>
                                                    <span className="ml-2 text-gray-600">{rule.college || 'Any'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">University:</span>
                                                    <span className="ml-2 text-gray-600">{formatArrayDisplay(rule.university_name)}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Source:</span>
                                                    <span className="ml-2 text-gray-600">{formatArrayDisplay(rule.source)}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="font-medium text-gray-700">Course:</span>
                                                    <div className="ml-2 text-gray-600 text-xs space-y-1">
                                                        {rule.course_conditions?.stream?.length > 0 && (
                                                            <div><strong>Streams:</strong> {formatArrayDisplay(rule.course_conditions.stream)}</div>
                                                        )}
                                                        {rule.course_conditions?.specialization?.length > 0 && (
                                                            <div><strong>Specializations:</strong> {formatArrayDisplay(rule.course_conditions.specialization)}</div>
                                                        )}
                                                        {rule.course_conditions?.degree?.length > 0 && (
                                                            <div><strong>Degrees:</strong> {formatArrayDisplay(rule.course_conditions.degree)}</div>
                                                        )}
                                                        {rule.course_conditions?.level?.length > 0 && (
                                                            <div><strong>Levels:</strong> {formatArrayDisplay(rule.course_conditions.level)}</div>
                                                        )}
                                                        {rule.course_conditions?.courseName?.length > 0 && (
                                                            <div><strong>Course Names:</strong> {formatArrayDisplay(rule.course_conditions.courseName)}</div>
                                                        )}
                                                        {(!rule.course_conditions?.stream?.length && !rule.course_conditions?.degree?.length &&
                                                            !rule.course_conditions?.specialization?.length && !rule.course_conditions?.level?.length && !rule.course_conditions?.courseName?.length) && (
                                                                <div>Any</div>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="font-medium text-gray-700">Assigned Agents:</span>
                                                    <div className="ml-2 text-gray-600">
                                                        {rule.assignedCounsellorDetails && rule.assignedCounsellorDetails.length > 0 ? (
                                                            rule.assignedCounsellorDetails.map((counsellor, index) => (
                                                                <span key={`${counsellor.counsellor_id}-${index}`} className="mr-2">
                                                                    {counsellor.counsellor_name}
                                                                    {index < rule.assignedCounsellorDetails.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span>No agents assigned</span>
                                                        )}
                                                        {rule.assignedCounsellorDetails && rule.assignedCounsellorDetails.length > 1 && (
                                                            <span className="ml-2 text-blue-600 text-xs">(Round Robin)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadAssignmentL3;