import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '../common/Modal';
import { BASE_URL } from '../config/api';
import axios from 'axios';
import statesData from '../data/cityandstatejson.json';
import { Calendar, GraduationCap, MapPin, Briefcase, Target, DollarSign, User, Building, Award, Clock, Star, ChevronDown, Search } from 'lucide-react';

const initialValues = {
    student_age: '',
    preferred_degree: '',
    preferred_specialization: '',
    student_current_state: '',
    student_current_city: '',
    highest_degree: '',
    completion_year: '',
    current_profession: '',
    current_profession_other: '',
    current_role: '',
    work_experience: '',
    objective: '',
    objective_other: '',
    preferred_budget: '',
};

const SearchableDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
    loading = false,
    className = "",
    icon: Icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option => {
        const optionText = option.label || option.value || option;
        return optionText.toLowerCase().includes(search.toLowerCase());
    });

    const selectedOption = options.find(option =>
        (option.value || option.label || option) === value
    );

    const handleSelect = (option) => {
        const selectedValue = option.value || option.label || option;
        onChange(selectedValue);
        setIsOpen(false);
        setSearch('');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full pl-11 pr-4 py-1.5 text-left border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${disabled ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm'} ${className}`}
                >
                    <div className="flex justify-between items-center">
                        <span className="truncate text-gray-700 font-medium">
                            {selectedOption ? (selectedOption.label || selectedOption.value || selectedOption) : placeholder}
                        </span>
                        <ChevronDown className={`w-3 h-3 ml-2 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {Icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Icon className="w-3 h-3" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg backdrop-blur-sm bg-white/95">
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                        {loading ? (
                            <div className="py-6 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-gray-500">
                                <Search className="w-3 h-3 mx-auto mb-2 text-gray-400" />
                                <p>No options found</p>
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const optionValue = option.value || option.label || option;
                                return (
                                    <button
                                        key={`option-${index}`}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-1.5 text-left transition-all duration-150 hover:bg-blue-50/80 hover:pl-5 ${value === optionValue ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500' : 'text-gray-700'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${value === optionValue ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            {option.label || option.value || option}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentFormPopup = ({ isOpen, onClose, onSubmit, studentId }) => {
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [filterOptions, setFilterOptions] = useState({
        degrees: [],
        specializations: []
    });
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (isOpen && studentId) {
                setInitialLoading(true);
                try {
                    const response = await axios.get(
                        `${BASE_URL}/student/${studentId}`,
                        { withCredentials: true }
                    );

                    if (response.data) {
                        const studentData = response.data;

                        let currentProfession = studentData.current_profession || '';
                        let currentProfessionOther = '';
                        let objective = studentData.objective || '';
                        let objectiveOther = '';

                        if (currentProfession && currentProfession.startsWith('Other-')) {
                            currentProfessionOther = currentProfession.substring(6);
                            currentProfession = 'Other';
                        }

                        if (objective && objective.startsWith('Other-')) {
                            objectiveOther = objective.substring(6);
                            objective = 'Other';
                        }

                        const initialFormData = {
                            student_age: studentData.student_age || '',
                            preferred_degree: studentData.preferred_degree?.[0] || '',
                            preferred_specialization: studentData.preferred_specialization?.[0] || '',
                            student_current_state: studentData.student_current_state || '',
                            student_current_city: studentData.student_current_city || '',
                            highest_degree: studentData.highest_degree || '',
                            completion_year: studentData.completion_year || '',
                            current_profession: currentProfession,
                            current_profession_other: currentProfessionOther,
                            current_role: studentData.current_role || '',
                            work_experience: studentData.work_experience || '',
                            objective: objective,
                            objective_other: objectiveOther,
                            preferred_budget: studentData.preferred_budget ? studentData.preferred_budget.toString() : '',
                        };

                        setForm(initialFormData);
                    }
                } catch (error) {
                    console.error('Failed to load student data:', error);
                } finally {
                    setInitialLoading(false);
                }
            }
        };
        fetchStudentData();
    }, [isOpen, studentId]);

    const fetchFilterOptionsData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/universitycourse/dropdown`);
            if (response.data) {
                const apiDegrees = response.data.data.degrees || [];
                const apiSpecs = response.data.data.specializations || [];
                const degrees = Array.isArray(apiDegrees[0])
                    ? apiDegrees.map(item => ({ value: item[0], label: item[1] }))
                    : apiDegrees.map(item => ({ value: item, label: item }));
                const specializations = Array.isArray(apiSpecs[0])
                    ? apiSpecs.map(item => ({ value: item[0], label: item[1] }))
                    : apiSpecs.map(item => ({ value: item, label: item }));
                setFilterOptions({ degrees, specializations });
            }
        } catch (error) {
            console.error('Failed to load options:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (form.student_current_state) {
            const selectedState = statesData.find(state => state.name === form.student_current_state);
            const cityOptions = selectedState?.cities?.map(city => ({ value: city, label: city })) || [];
            setCities(cityOptions);
            if (form.student_current_city && !cityOptions.some(city => city.value === form.student_current_city)) {
                setForm(prev => ({ ...prev, student_current_city: '' }));
            }
        } else {
            setCities([]);
        }
    }, [form.student_current_state, form.student_current_city]);

    useEffect(() => {
        if (isOpen) {
            fetchFilterOptionsData();
        }
    }, [isOpen]);

    const handleChange = useCallback((name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'student_age') {
            if (value === '' || /^\d{0,2}$/.test(value)) {
                setForm((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }
        if (name === 'completion_year') {
            if (value === '' || /^\d{0,4}$/.test(value)) {
                setForm((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'student_age':
                if (value && !/^\d+$/.test(value)) return 'Age must be a valid number';
                if (value && (parseInt(value) < 0 || parseInt(value) > 99)) return 'Age must be between 0-99';
                return '';
            case 'completion_year':
                if (value && !/^\d{4}$/.test(value)) return 'Enter a valid 4-digit year';
                if (value) {
                    const currentYear = new Date().getFullYear();
                    const year = parseInt(value);
                    if (year < 1950 || year > currentYear + 1) return `Year must be between 1950-${currentYear + 1}`;
                }
                return '';
            case 'current_profession_other':
                if (form.current_profession === 'Other' && (!value || !value.trim()))
                    return 'Please specify profession';
                return '';
            case 'objective_other':
                if (form.objective === 'Other' && (!value || !value.trim()))
                    return 'Please specify objective';
                return '';
            default:
                return '';
        }
    }, [form.current_profession, form.objective]);

    const validate = useCallback(() => {
        const newErrors = {};
        Object.keys(form).forEach((key) => {
            if (!form[key] && !key.includes('_other')) return;
            const error = validateField(key, form[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, validateField]);

    const saveData = useCallback(async () => {
        if (!validate()) return false;

        try {
            setIsSubmitting(true);
            const payload = {};

            if (form.student_age) payload.student_age = parseInt(form.student_age) || 0;
            if (form.preferred_degree) payload.preferredDegree = form.preferred_degree;
            if (form.preferred_specialization) payload.preferredSpecialization = form.preferred_specialization;
            if (form.student_current_state) payload.student_current_state = form.student_current_state;
            if (form.student_current_city) payload.student_current_city = form.student_current_city;
            if (form.highest_degree) payload.highest_degree = form.highest_degree;
            if (form.completion_year) payload.completion_year = form.completion_year;

            if (form.current_profession) {
                if (form.current_profession === 'Other' && form.current_profession_other?.trim()) {
                    payload.current_profession = `Other-${form.current_profession_other.trim()}`;
                } else if (form.current_profession !== 'Other') {
                    payload.current_profession = form.current_profession;
                }
            }

            if (form.current_role) payload.current_role = form.current_role;
            if (form.work_experience) payload.work_experience = form.work_experience;

            if (form.objective) {
                if (form.objective === 'Other' && form.objective_other?.trim()) {
                    payload.objective = `Other-${form.objective_other.trim()}`;
                } else if (form.objective !== 'Other') {
                    payload.objective = form.objective;
                }
            }

            if (form.preferred_budget) {
                payload.preferredBudget = parseInt(form.preferred_budget) || 0;
            }

            if (studentId) {
                await axios.put(
                    `${BASE_URL}/student/updateStudentDetails/${studentId}`,
                    { payload },
                    { withCredentials: true }
                );
            }

            onSubmit?.(payload);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [form, validate, studentId, onSubmit]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const success = await saveData();
        if (success) onClose?.();
    }, [saveData, onClose]);

    const handleCrossClose = useCallback(async () => {
        const success = await saveData();
        if (success) onClose?.();
    }, [saveData, onClose]);

    if (!isOpen) return null;

    const stateOptions = statesData.map(state => ({
        value: state.name,
        label: state.name
    }));

    const highestDegreeOptions = [
        { value: '10th', label: '10th Standard' },
        { value: '12th', label: '12th Standard' },
        { value: 'Diploma', label: 'Diploma' },
        { value: 'Bachelor', label: 'Bachelor\'s Degree' },
        { value: 'Master', label: 'Master\'s Degree' },
        { value: 'PhD', label: 'PhD / Doctorate' }
    ];

    const professionOptions = [
        { value: 'Working Professional', label: 'Working Professional' },
        { value: 'Government Exam Prep', label: 'Government Exam Prep' },
        { value: 'Looking for Job', label: 'Looking for Job' },
        { value: 'Skill Course', label: 'Skill Course' },
        { value: 'Business Owner', label: 'Business Owner' },
        { value: 'Other', label: 'Other' }
    ];

    const experienceOptions = [
        { value: 'Fresher', label: 'Fresher (0 years)' },
        { value: '< 1 year', label: 'Less than 1 year' },
        { value: '1-3 years', label: '1 – 3 years' },
        { value: '3-5 years', label: '3 – 5 years' },
        { value: '5-10 years', label: '5 – 10 years' },
        { value: '10+ years', label: '10+ years' }
    ];

    const objectiveOptions = [
        { value: 'Career Growth', label: 'Career Growth' },
        { value: 'Job Switch', label: 'Job Switch' },
        { value: 'Higher Studies', label: 'Higher Studies' },
        { value: 'Government Job', label: 'Government Job' },
        { value: 'Business Growth', label: 'Business Growth' },
        { value: 'Skill Enhancement', label: 'Skill Enhancement' },
        { value: 'Salary Increment', label: 'Salary Increment' },
        { value: 'Other', label: 'Other' }
    ];

    const budgetOptions = [
        { value: '0-50000', label: 'Under ₹50,000' },
        { value: '50000-70000', label: '₹50,000 – ₹70,000' },
        { value: '70000-100000', label: '₹70,000 – ₹1,00,000' },
        { value: '100000-150000', label: '₹1,00,000 – ₹1,50,000' },
        { value: '150000-200000', label: '₹1,50,000 – ₹2,00,000' },
        { value: '200000-999999999', label: 'Above ₹2,00,000' }
    ];

    if (initialLoading) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleCrossClose}
                title="Student Form"
                size="7xl"
                height="lg"
            >
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-6 text-gray-600 font-medium text-lg">Loading student information...</p>
                        <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the details</p>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCrossClose}
            title={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Student Form</h2>
                        <p className="text-sm text-gray-500">Update and manage student details</p>
                    </div>
                </div>
            }
            size="7xl"
            height="lg"
            onSubmit={handleSubmit}
            submitText="Save Changes"
            cancelText="Cancel"
            onCancel={handleCrossClose}
            onConfirm={handleSubmit}
            isSubmitting={isSubmitting}
            hideFooter={false}
        >
            <form onSubmit={handleSubmit} >
                <div className="space-y-4 p-1 grid grid-cols-2 gap-4">
                    <div className=" rounded-2xl ">
                        <div className="flex items-center mb-6">

                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                                <p className="text-sm text-gray-500">Basic details about the student</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1  gap-3">
                            {/* Age */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <User className="w-3 h-3 mr-2 text-blue-500" />
                                    Student Age
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="student_age"
                                        value={form.student_age}
                                        onChange={handleInputChange}
                                        className={`w-full pl-7 placeholder:text-sm pr-4 py-1.5 border rounded transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${errors.student_age ? 'border-red-300 bg-red-50/50' : 'border-gray-300 hover:border-blue-400'}`}
                                        placeholder="Enter age"
                                        maxLength={2}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                    </div>
                                </div>
                                {errors.student_age && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                        {errors.student_age}
                                    </p>
                                )}
                            </div>

                            {/* Current State */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <MapPin className="w-3 h-3 mr-2 text-blue-500" />
                                    Current State
                                </label>
                                <SearchableDropdown
                                    options={stateOptions}
                                    value={form.student_current_state}
                                    onChange={(value) => handleChange('student_current_state', value)}
                                    placeholder="Select state"
                                    icon={MapPin}
                                />
                            </div>

                            {/* Current City */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Building className="w-3 h-3 mr-2 text-blue-500" />
                                    Current City
                                </label>
                                <SearchableDropdown
                                    options={cities}
                                    value={form.student_current_city}
                                    onChange={(value) => handleChange('student_current_city', value)}
                                    placeholder={form.student_current_state ? "Select city" : "Select state first"}
                                    disabled={!form.student_current_state}
                                    icon={Building}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border border-green-100/50">
                        <div className="flex items-center mb-6">

                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Education Details</h3>
                                <p className="text-sm text-gray-500">Academic background and preferences</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1  gap-3">
                            {/* Preferred Degree */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Award className="w-3 h-3 mr-2 text-green-500" />
                                    Preferred Degree
                                </label>
                                <SearchableDropdown
                                    options={filterOptions.degrees}
                                    value={form.preferred_degree}
                                    onChange={(value) => handleChange('preferred_degree', value)}
                                    placeholder="Select degree"
                                    disabled={loading}
                                    loading={loading}
                                    icon={Award}
                                />
                            </div>

                            {/* Preferred Specialization */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Star className="w-3 h-3 mr-2 text-green-500" />
                                    Preferred Specialization
                                </label>
                                <SearchableDropdown
                                    options={filterOptions.specializations}
                                    value={form.preferred_specialization}
                                    onChange={(value) => handleChange('preferred_specialization', value)}
                                    placeholder="Select specialization"
                                    disabled={loading}
                                    loading={loading}
                                    icon={Star}
                                />
                            </div>

                            {/* Highest Degree */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <GraduationCap className="w-3 h-3 mr-2 text-green-500" />
                                    Highest Degree
                                </label>
                                <SearchableDropdown
                                    options={highestDegreeOptions}
                                    value={form.highest_degree}
                                    onChange={(value) => handleChange('highest_degree', value)}
                                    placeholder="Select highest degree"
                                    icon={GraduationCap}
                                />
                            </div>

                            {/* Completion Year */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-green-500" />
                                    Completion Year
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="completion_year"
                                        value={form.completion_year}
                                        onChange={handleInputChange}
                                        className={`w-full pl-7 placeholder:text-sm pr-4 py-1.5 border rounded transition-all duration-200 focus:ring-2 focus:ring-green-500/30 focus:border-green-400 ${errors.completion_year ? 'border-red-300 bg-red-50/50' : 'border-gray-300 hover:border-green-400'}`}
                                        placeholder="e.g., 2023"
                                        maxLength={4}
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                    </div>
                                </div>
                                {errors.completion_year && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                        {errors.completion_year}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="">
                    <div className="flex items-center mb-6">

                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Career & Professional Details</h3>
                            <p className="text-sm text-gray-500">Work experience and career objectives</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Profession */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <Briefcase className="w-3 h-3 mr-2 text-purple-500" />
                                Current Profession
                            </label>
                            <SearchableDropdown
                                options={professionOptions}
                                value={form.current_profession}
                                onChange={(value) => handleChange('current_profession', value)}
                                placeholder="Select profession"
                                icon={Briefcase}
                            />
                            {form.current_profession === 'Other' && (
                                <div className="relative mt-3">
                                    <input
                                        type="text"
                                        name="current_profession_other"
                                        value={form.current_profession_other}
                                        onChange={handleInputChange}
                                        placeholder="Specify profession"
                                        className="w-full pl-7 placeholder:text-sm pr-4 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Briefcase className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                            {errors.current_profession_other && (
                                <p className="text-xs text-red-600 mt-1 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                    {errors.current_profession_other}
                                </p>
                            )}
                        </div>

                        {/* Current Role */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <User className="w-3 h-3 mr-2 text-purple-500" />
                                Current Role / Designation
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="current_role"
                                    value={form.current_role}
                                    onChange={handleInputChange}
                                    className="w-full pl-7 placeholder:text-sm pr-4 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 hover:border-purple-400"
                                    placeholder="e.g., Software Developer"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <User className="w-3 h-3" />
                                </div>
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <Clock className="w-3 h-3 mr-2 text-purple-500" />
                                Work Experience
                            </label>
                            <SearchableDropdown
                                options={experienceOptions}
                                value={form.work_experience}
                                onChange={(value) => handleChange('work_experience', value)}
                                placeholder="Select experience"
                                icon={Clock}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <Target className="w-3 h-3 mr-2 text-purple-500" />
                                Objective of Degree
                            </label>
                            <SearchableDropdown
                                options={objectiveOptions}
                                value={form.objective}
                                onChange={(value) => handleChange('objective', value)}
                                placeholder="Select objective"
                                icon={Target}
                            />
                            {form.objective === 'Other' && (
                                <div className="relative mt-3">
                                    <input
                                        type="text"
                                        name="objective_other"
                                        value={form.objective_other}
                                        onChange={handleInputChange}
                                        placeholder="Specify objective"
                                        className="w-full pl-7 placeholder:text-sm pr-4 py-1.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Target className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                            {errors.objective_other && (
                                <p className="text-xs text-red-600 mt-1 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                    {errors.objective_other}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <DollarSign className="w-3 h-3 mr-2 text-purple-500" />
                                Budget for Course
                            </label>
                            <SearchableDropdown
                                options={budgetOptions}
                                value={form.preferred_budget}
                                onChange={(value) => handleChange('preferred_budget', value)}
                                placeholder="Select budget"
                                icon={DollarSign}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default StudentFormPopup;