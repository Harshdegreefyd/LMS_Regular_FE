import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Edit2, Trash2, Save, Loader, Download, Plus, X, Eye, Upload, Edit3, List, CheckCircle, XCircle, Power, FileText, Star, Shield, Globe, Settings } from 'lucide-react';
import * as courseApi from '../network/courseHeaderValue';
import Modal from "../common/Modal";
import { BrochureModal } from '../components/BrochureModal';

const CourseManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureFile, setBrochureFile] = useState(null);
  
  // Modal states
  const [showUspModal, setShowUspModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showConfirmDisableModal, setShowConfirmDisableModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [universityToDisable, setUniversityToDisable] = useState(null);
  
  // University brochure states
  const [showUniversityBrochureModal, setShowUniversityBrochureModal] = useState(false);
  const [selectedUniversityForBrochure, setSelectedUniversityForBrochure] = useState(null);
  const [universityBrochureFile, setUniversityBrochureFile] = useState(null);
  const [universityBrochureLoading, setUniversityBrochureLoading] = useState(false);

  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [currentField, setCurrentField] = useState('');
  const [modalPoints, setModalPoints] = useState([]);

  // Add Course state
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    degree_name: '',
    specialization: '',
    stream: '',
    level: '',
    study_mode: '',
    status: 'Active',
    total_fees: '',
    annual_fees: '',
    semester_fees: '',
    duration: '',
    duration_type: 'Years',
    university_state: '',
    university_city: '',
    brochure_url: '',
    usp: [],
    eligibility: []
  });

  // Bulk update state
  const [bulkUpdates, setBulkUpdates] = useState({
    brochure: null,
    usp: [],
    eligibility: []
  });

  // Bulk upload state
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [selectedBulkUniversity, setSelectedBulkUniversity] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await courseApi.getAllUniversities();
      console.log(res.data.data);
      
      // Add has_brochure field to universities if your API doesn't return it
      const universitiesWithBrochure = Array.isArray(res.data.data) 
        ? res.data.data.map(uni => ({
            ...uni,
            has_brochure: uni.has_brochure || false // Default to false if not provided
          }))
        : [];
      
      setUniversities(universitiesWithBrochure);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
    }
  };

  const fetchUniversityCourses = async (universityName) => {
    setLoading(true);
    try {
      const res = await courseApi.getUniversityCourseMappings(universityName);
      setCourses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityClick = (university) => {
    setSelectedUniversity(university);
    fetchUniversityCourses(university.university_name);
    setSearchTerm('');
  };

  const handleBack = () => {
    setSelectedUniversity(null);
    setCourses([]);
    setEditingCourseId(null);
    setSearchTerm('');
  };

  const toggleEdit = (courseId) => {
    setEditingCourseId(editingCourseId === courseId ? null : courseId);
  };

  const updateCourseBrochure = async (courseId) => {
    if (!brochureFile) {
      setMessage('Please select a brochure file');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('brochure', brochureFile);

      const res = await courseApi.updateUniversal(
        selectedUniversity.university_name,
        courseId,
        formData
      );

      setCourses(prev => prev.map(course =>
        course.course_id === courseId ? {
          ...course,
          brochure_url: URL.createObjectURL(brochureFile),
          hasApiMapping: true
        } : course
      ));

      setMessage('Brochure uploaded successfully');
      setShowBrochureModal(false);
      setBrochureFile(null);
      setCurrentCourseId(null);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading brochure: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updateCourseField = async (courseId, field, value) => {
    try {
      setCourses(prev => prev.map(course =>
        course.course_id === courseId ? { ...course, [field]: value } : course
      ));

      await courseApi.updateCourse(courseId, { [field]: value });

      setMessage('Field updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setMessage('Error updating field');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updateCourseArrayField = async (courseId, field, points) => {
    try {
      const formData = new FormData();
      formData.append(field, JSON.stringify(points));

      const res = await courseApi.updateUniversal(
        selectedUniversity.university_name,
        courseId,
        formData
      );

      setCourses(prev => prev.map(course =>
        course.course_id === courseId ? { ...course, [field]: points } : course
      ));

      setMessage(`${field.toUpperCase()} updated successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error updating ${field}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const toggleCourseStatus = async (courseId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'Active' ? 'disable' : 'enable'} this course?`)) return;

    try {
      await courseApi.toggleUniversityCoursesStatus(selectedUniversity.university_name, courseId);
      setCourses(prev => prev.map(course =>
        course.course_id === courseId ? { ...course, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : course
      ));
      setMessage(`Course ${currentStatus === 'Active' ? 'disabled' : 'enabled'} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating course status');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const toggleAllUniversityCourses = async (universityName, currentStatus) => {
    try {
      const res = await courseApi.disableAllCourses('all', universityName);
      setMessage(res.data.message || 'All courses updated successfully');
      setTimeout(() => setMessage(''), 3000);

      fetchUniversities();
    } catch (error) {
      setMessage('Error updating all courses');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const openDisableConfirmModal = (university) => {
    setUniversityToDisable(university);
    setShowConfirmDisableModal(true);
  };

  const handleBulkUpdate = async (universityName) => {
    if (!bulkUpdates.usp.length && !bulkUpdates.eligibility.length && !bulkUpdates.brochure) {
      setMessage('Please provide at least one update');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    try {
      const formData = new FormData();

      if (bulkUpdates.brochure) {
        formData.append('brochure', bulkUpdates.brochure);
      }

      if (bulkUpdates.usp.length > 0) {
        formData.append('usp', JSON.stringify(bulkUpdates.usp));
      }

      if (bulkUpdates.eligibility.length > 0) {
        formData.append('eligibility', JSON.stringify(bulkUpdates.eligibility));
      }

      const res = await courseApi.updateUniversal(
        universityName,
        'all',
        formData
      );

      setMessage(res.data.message || 'Bulk update successful');
      setShowBulkUpdateModal(false);
      setBulkUpdates({ brochure: null, usp: [], eligibility: [] });

      if (selectedUniversity?.university_name === universityName) {
        fetchUniversityCourses(universityName);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error performing bulk update: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddCourse = async () => {
    try {
      console.log("hi")
      if (!newCourse.course_name || !newCourse.degree_name || !newCourse.level || !newCourse.study_mode ||
        !newCourse.duration || !newCourse.duration_type) {
        setMessage('Please fill all required fields (marked with *)');
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      const courseData = {
        ...newCourse,
        university_name: newCourse.university_name || selectedUniversity?.university_name
      };

      const res = await courseApi.bulkImportCourses([courseData]);

      setMessage(res.data.message || 'Course added successfully');
      setShowAddCourseModal(false);
      resetNewCourse();

      if (selectedUniversity) {
        fetchUniversityCourses(selectedUniversity.university_name);
      } else {
        fetchUniversities();
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding course: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

const handleBulkUpload = async () => {
  if (!bulkUploadFile) {
    setMessage("Please select a file to upload");
    setTimeout(() => setMessage(""), 5000);
    return;
  }

  if (!bulkUploadFile.name.toLowerCase().endsWith(".csv")) {
    setMessage("Please upload a CSV file");
    setTimeout(() => setMessage(""), 5000);
    return;
  }

  setBulkUploadLoading(true);

  // ================= CSV PARSER =================
  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  // ================= CLEANERS =================
  const cleanValue = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).replace(/^"+|"+$/g, "").trim();
  };

  const cleanNumber = (val) => {
    if (!val) return null;
    const num = String(val).replace(/,/g, "").trim();
    return num === "" ? null : Number(num);
  };

  // ================= FILE READ =================
  try {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;

        const lines = text
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          throw new Error("CSV must contain headers and data rows");
        }

        const headers = parseCSVLine(lines[0]).map(cleanValue);

        const numericFields = [
          "semester_fees",
          "annual_fees",
          "total_fees",
          "registration_fee",
          "exam_fee",
          "alumni_fee",
          "duration"
        ];

        const courses = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const course = {};

          headers.forEach((header, index) => {
            let value = cleanValue(values[index] || "");

            if (numericFields.includes(header)) {
              value = cleanNumber(value);
            }

            course[header] = value;
          });

          if (selectedBulkUniversity && !course.university_name) {
            course.university_name = selectedBulkUniversity;
          }

          if (!course.status) {
            course.status = "Active";
          }

          if (course.course_name && course.university_name && course.degree_name) {
            courses.push(course);
          } else {
            console.warn(`Skipping row ${i + 1}`, course);
          }
        }

        if (!courses.length) {
          throw new Error("No valid rows found");
        }

        const res = await courseApi.bulkImportCourses(courses);

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Upload failed");
        }

        setMessage(`${courses.length} courses uploaded successfully`);
        setShowBulkUploadModal(false);
        setBulkUploadFile(null);
        setSelectedBulkUniversity("");

        selectedUniversity
          ? fetchUniversityCourses(selectedUniversity.university_name)
          : fetchUniversities();

      } catch (err) {
        console.error(err);
        setMessage("Error: " + err.message);
      } finally {
        setBulkUploadLoading(false);
        setTimeout(() => setMessage(""), 5000);
      }
    };

    reader.onerror = () => {
      setMessage("Error reading file");
      setBulkUploadLoading(false);
    };

    reader.readAsText(bulkUploadFile);

  } catch (err) {
    setMessage("Upload error: " + err.message);
    setBulkUploadLoading(false);
  }
};



  const handleExport = async () => {
    try {
      let exportData = [];
      let fileName = '';

      if (selectedUniversity) {
        exportData = courses;
        fileName = `courses_${selectedUniversity.university_name}_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        exportData = universities.map(uni => ({
          university_name: uni.university_name,
          total_courses: uni.total_courses || 0,
          active_courses: uni.active_courses || 0,
          inactive_courses: uni.inactive_courses || 0,
          mapped_courses_count: uni.mapped_courses_count || 0
        }));
        fileName = `universities_summary_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header =>
          JSON.stringify(row[header] || '')).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('Export started successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error exporting data');
      setTimeout(() => setMessage(''), 5000);
    }
  };

 const handleUniversityBrochureUpload = async () => {
  if (!selectedUniversityForBrochure || !universityBrochureFile) {
    setMessage('Please select a university and brochure file');
    setTimeout(() => setMessage(''), 5000);
    return;
  }

  setUniversityBrochureLoading(true);
  try {
    const formData = new FormData();
    
    // Append the file directly, not as another FormData
    formData.append('brochure', universityBrochureFile);

    console.log('Uploading brochure file:', universityBrochureFile);
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const res = await courseApi.uploadUniversityBrochure(
      selectedUniversityForBrochure.university_name,
      formData
    );

    console.log('Upload response:', res.data);

    if (res.data.success) {
      setMessage('University brochure uploaded successfully');
      setShowUniversityBrochureModal(false);
      setUniversityBrochureFile(null);
      setSelectedUniversityForBrochure(null);

      // Refresh universities list to show updated brochure status
      fetchUniversities();
    } else {
      setMessage('Error: ' + res.data.message);
    }

    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    console.error('Upload error:', error);
    setMessage('Error uploading university brochure: ' + (error.response?.data?.message || error.message));
    setTimeout(() => setMessage(''), 5000);
  } finally {
    setUniversityBrochureLoading(false);
  }
};

  const refreshUniversities = () => {
    fetchUniversities();
    setMessage('Universities refreshed');
    setTimeout(() => setMessage(''), 3000);
  };

  const resetNewCourse = () => {
    setNewCourse({
      course_name: '',
      degree_name: '',
      specialization: '',
      stream: '',
      level: '',
      study_mode: '',
      status: 'Active',
      total_fees: '',
      annual_fees: '',
      semester_fees: '',
      duration: '',
      duration_type: 'Years',
      university_state: '',
      university_city: '',
      brochure_url: '',
      usp: [],
      eligibility: []
    });
  };

  const filteredUniversities = universities.filter(uni =>
    uni.university_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedUniversity) {
    return (
      <CoursesTableView
        university={selectedUniversity}
        courses={courses}
        loading={loading}
        onBack={handleBack}
        editingCourseId={editingCourseId}
        onToggleEdit={toggleEdit}
        onUpdateField={updateCourseField}
        onUpdateArrayField={updateCourseArrayField}
        onToggleStatus={toggleCourseStatus}
        onToggleAllUniversityCourses={toggleAllUniversityCourses}
        onBulkUpdate={handleBulkUpdate}
        showBrochureModal={showBrochureModal}
        setShowBrochureModal={setShowBrochureModal}
        brochureFile={brochureFile}
        setBrochureFile={setBrochureFile}
        currentCourseId={currentCourseId}
        setCurrentCourseId={setCurrentCourseId}
        onUpdateBrochure={updateCourseBrochure}
        showUspModal={showUspModal}
        setShowUspModal={setShowUspModal}
        showEligibilityModal={showEligibilityModal}
        setShowEligibilityModal={setShowEligibilityModal}
        showBulkUpdateModal={showBulkUpdateModal}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        showBulkUploadModal={showBulkUploadModal}
        setShowBulkUploadModal={setShowBulkUploadModal}
        bulkUploadFile={bulkUploadFile}
        setBulkUploadFile={setBulkUploadFile}
        selectedBulkUniversity={selectedBulkUniversity}
        setSelectedBulkUniversity={setSelectedBulkUniversity}
        bulkUploadLoading={bulkUploadLoading}
        onBulkUpload={handleBulkUpload}
        currentField={currentField}
        setCurrentField={setCurrentField}
        modalPoints={modalPoints}
        setModalPoints={setModalPoints}
        bulkUpdates={bulkUpdates}
        setBulkUpdates={setBulkUpdates}
        onAddCourseClick={() => setShowAddCourseModal(true)}
        onBulkUploadClick={() => setShowBulkUploadModal(true)}
        onExport={handleExport}
      />
    );
  }

  return (
    <>
      <UniversitiesView
        universities={filteredUniversities}
        onUniversityClick={handleUniversityClick}
        onDisableUniversity={openDisableConfirmModal}
        onUniversityBrochureClick={(university) => {
          setSelectedUniversityForBrochure(university);
          setShowUniversityBrochureModal(true);
        }}
        message={message}
        onClearMessage={() => setMessage('')}
        onRefresh={refreshUniversities}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddCourseClick={() => setShowAddCourseModal(true)}
        onBulkUploadClick={() => setShowBulkUploadModal(true)}
        onExport={handleExport}
      />

      {/* Confirm Disable Modal */}
      {showConfirmDisableModal && universityToDisable && (
        <ConfirmDisableModal
          university={universityToDisable}
          onConfirm={toggleAllUniversityCourses}
          onCancel={() => {
            setShowConfirmDisableModal(false);
            setUniversityToDisable(null);
          }}
        />
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <AddCourseModal
          universities={universities}
          selectedUniversity={selectedUniversity}
          newCourse={newCourse}
          setNewCourse={setNewCourse}
          onConfirm={handleAddCourse}
          onCancel={() => {
            setShowAddCourseModal(false);
            resetNewCourse();
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          universities={universities}
          selectedUniversity={selectedUniversity}
          bulkUploadFile={bulkUploadFile}
          setBulkUploadFile={setBulkUploadFile}
          selectedBulkUniversity={selectedBulkUniversity}
          setSelectedBulkUniversity={setSelectedBulkUniversity}
          loading={bulkUploadLoading}
          onConfirm={handleBulkUpload}
          onCancel={() => {
            setShowBulkUploadModal(false);
            setBulkUploadFile(null);
            setSelectedBulkUniversity('');
          }}
          onDownloadTemplate={handleExport}
        />
      )}

      {/* University Brochure Modal */}
      {showUniversityBrochureModal && selectedUniversityForBrochure && (
        <UniversityBrochureModal
          university={selectedUniversityForBrochure}
          brochureFile={universityBrochureFile}
          setBrochureFile={setUniversityBrochureFile}
          loading={universityBrochureLoading}
          onConfirm={handleUniversityBrochureUpload}
          onCancel={() => {
            setShowUniversityBrochureModal(false);
            setUniversityBrochureFile(null);
            setSelectedUniversityForBrochure(null);
          }}
        />
      )}
    </>
  );
};

const UniversitiesView = ({
  universities,
  onUniversityClick,
  onDisableUniversity,
  onUniversityBrochureClick,
  message,
  onClearMessage,
  onRefresh,
  searchTerm,
  onSearchChange,
  onAddCourseClick,
  onBulkUploadClick,
  onExport
}) => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">University Management</h1>
          <p className="text-gray-600 mt-1">Manage courses across all universities</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-3 mb-6">
            <button
              onClick={onAddCourseClick}
              className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
            <button
              onClick={onBulkUploadClick}
              className="px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2.5 text-nowrap bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6">
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex justify-between items-center">
            <p className="font-medium">{message}</p>
            <button onClick={onClearMessage} className="p-1 hover:bg-red-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search universities..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">University</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">API Mapped</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Brochure</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-80">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.isArray(universities) && universities.length > 0 ? universities.map((uni) => (
              <tr key={uni.university_name} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {uni.university_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{uni.university_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${uni.active_courses > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {uni.active_courses || 0} Active
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${uni.inactive_courses > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                          {uni.inactive_courses || 0} Inactive
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">{uni.total_courses || 0}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    {uni.active_courses || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                    {uni.inactive_courses || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${(uni.mapped_courses_count || 0) > 0
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {uni.mapped_courses_count || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {uni.has_brochure ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                        <FileText className="w-4 h-4 mr-1" />
                        Uploaded
                      </span>
                      {uni.brochure_url && (
                        <a 
                          href={uni.brochure_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
                      No Brochure
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-col">
                    <button
                      onClick={() => onUniversityClick(uni)}
                      className="px-4 py-2 bg-blue-600 text-nowrap text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Courses
                    </button>
                    <button
                      onClick={() => onUniversityBrochureClick(uni)}
                      className="px-4 py-2 bg-indigo-600 text-white text-nowrap text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Add Brochure
                    </button>
                    <button
                      onClick={() => onDisableUniversity(uni)}
                      className="px-4 py-2 bg-red-600 text-white text-nowrap text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Toggle Status
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    {searchTerm ? 'No universities found matching your search' : 'Loading universities...'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const CoursesTableView = ({
  university, courses, loading, onBack, editingCourseId, onToggleEdit,
  onUpdateField, onUpdateArrayField, onToggleStatus, onBulkUpdate,
  showBrochureModal, setShowBrochureModal, brochureFile, setBrochureFile,
  currentCourseId, setCurrentCourseId, onUpdateBrochure,
  showUspModal, setShowUspModal, showEligibilityModal, setShowEligibilityModal,
  showBulkUpdateModal, setShowBulkUpdateModal,
  showBulkUploadModal, setShowBulkUploadModal, bulkUploadFile, setBulkUploadFile,
  selectedBulkUniversity, setSelectedBulkUniversity, bulkUploadLoading,
  onBulkUpload,
  currentField, setCurrentField,
  modalPoints, setModalPoints,
  bulkUpdates, setBulkUpdates,
  onAddCourseClick,
  onBulkUploadClick,
  onExport,
}) => {
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const [localEdits, setLocalEdits] = useState({});
  const [searchCourse, setSearchCourse] = useState('');
  const [bulkUspInput, setBulkUspInput] = useState('');
  const [bulkEligibilityInput, setBulkEligibilityInput] = useState('');

  const handleInputChange = (courseId, field, value) => {
    setLocalEdits(prev => ({
      ...prev,
      [`${courseId}_${field}`]: value
    }));
  };

  const handleSaveChanges = (courseId) => {
    Object.keys(localEdits).forEach(key => {
      if (key.startsWith(`${courseId}_`)) {
        const field = key.split('_').slice(1).join('_');
        const value = localEdits[key];
        onUpdateField(courseId, field, value);
      }
    });

    const newLocalEdits = { ...localEdits };
    Object.keys(localEdits).forEach(key => {
      if (key.startsWith(`${courseId}_`)) {
        delete newLocalEdits[key];
      }
    });
    setLocalEdits(newLocalEdits);
    onToggleEdit(courseId);
  };

  const formatArrayField = (value) => {
    if (!value && value !== 0) return '-';

    if (typeof value === 'string') {
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.length > 0 ? `${parsed.length} points` : '-';
          }
        } catch {
          return value;
        }
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} points` : '-';
    }

    return String(value);
  };

  const openModal = (courseId, field, currentValue) => {
    setCurrentCourseId(courseId);
    setCurrentField(field);

    let points = [];

    if (currentValue) {
      if (Array.isArray(currentValue)) {
        points = currentValue.filter(item => item != null);
      } else if (typeof currentValue === 'string') {
        try {
          const parsed = JSON.parse(currentValue);
          if (Array.isArray(parsed)) {
            points = parsed.filter(item => item != null);
          } else {
            points = currentValue ? [currentValue] : [];
          }
        } catch {
          points = currentValue ? [currentValue] : [];
        }
      }
    }

    setModalPoints(points);
    if (field === 'usp') {
      setShowUspModal(true);
    } else {
      setShowEligibilityModal(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const newPoint = e.target.value.trim();
      if (newPoint) {
        setModalPoints(prev => [...prev, newPoint]);
        e.target.value = '';
      }
    }
  };

  const saveModalPoints = () => {
    onUpdateArrayField(currentCourseId, currentField, modalPoints);
    if (currentField === 'usp') setShowUspModal(false);
    else setShowEligibilityModal(false);
    setModalPoints([]);
  };

  const handleBulkUspKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const newPoint = bulkUspInput.trim();
      if (newPoint) {
        setBulkUpdates(prev => ({
          ...prev,
          usp: [...prev.usp, newPoint]
        }));
        setBulkUspInput('');
      }
    }
  };

  const handleBulkEligibilityKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const newPoint = bulkEligibilityInput.trim();
      if (newPoint) {
        setBulkUpdates(prev => ({
          ...prev,
          eligibility: [...prev.eligibility, newPoint]
        }));
        setBulkEligibilityInput('');
      }
    }
  };

  const removeBulkUspPoint = (index) => {
    setBulkUpdates(prev => ({
      ...prev,
      usp: prev.usp.filter((_, i) => i !== index)
    }));
  };

  const removeBulkEligibilityPoint = (index) => {
    setBulkUpdates(prev => ({
      ...prev,
      eligibility: prev.eligibility.filter((_, i) => i !== index)
    }));
  };

  const handleBulkFileUpload = () => {
    const file = bulkFileInputRef.current?.files[0];
    if (file) {
      setBulkUpdates(prev => ({
        ...prev,
        brochure: file
      }));
    }
  };

  const clearBulkFile = () => {
    setBulkUpdates(prev => ({
      ...prev,
      brochure: null
    }));
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
    }
  };

  const filteredCourses = courses.filter(course =>
    course.course_name?.toLowerCase().includes(searchCourse.toLowerCase()) ||
    course.course_id?.toString().includes(searchCourse)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 text-nowrap">{university.university_name}</h1>
                <p className="text-gray-600">{courses.length} courses • {courses.filter(c => c.status === 'Active').length} Active</p>
              </div>
              <div className="flex gap-3 ml-4">
                <button
                  onClick={() => setShowBulkUpdateModal(true)}
                  className="px-4 py-2 bg-purple-600 text-nowrap text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Bulk Update
                </button>
                <button
                  onClick={onAddCourseClick}
                  className="px-4 py-2 bg-green-600 text-nowrap text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
                <button
                  onClick={onBulkUploadClick}
                  className="px-4 py-2 bg-blue-600 text-nowrap text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </button>
                <button
                  onClick={onExport}
                  className="px-4 py-2 bg-gray-800 text-nowrap text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                className="px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchCourse && (
                <button
                  onClick={() => setSearchCourse('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 w-32 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-3 py-3 w-64 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Course Name</th>
                      <th className="px-3 py-3 w-28 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Degree</th>
                      <th className="px-3 py-3 w-48 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialization</th>
                      <th className="px-3 py-3 w-40 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Stream</th>
                      <th className="px-3 py-3 w-24 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
                      <th className="px-3 py-3 w-24 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Mode</th>
                      <th className="px-3 py-3 w-24 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 w-32 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Fees</th>
                      <th className="px-3 py-3 w-32 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Annual Fees</th>
                      <th className="px-3 py-3 w-36 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Semester Fees</th>
                      <th className="px-3 py-3 w-24 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-3 w-32 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration Type</th>
                      <th className="px-3 py-3 w-28 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                      <th className="px-3 py-3 w-28 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">City</th>
                      <th className="px-3 py-3 w-40 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Brochure</th>
                      <th className="px-3 py-3 w-32 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">USP</th>
                      <th className="px-3 py-3 w-40 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Eligibility</th>
                      <th className="px-3 py-3 w-20 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">API</th>
                      <th className="px-3 py-3 w-40 text-left text-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses.map((course) => {
                      const isEditing = editingCourseId === course.course_id;

                      return (
                        <tr
                          key={course.course_id}
                          className={`transition-all text-nowrap ${isEditing
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <td className="px-3 py-3 w-32 align-top">
                            <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                              {course.course_id || '-'}
                            </div>
                          </td>

                          <td className="px-3 py-3 w-64 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_course_name`] !== undefined
                                  ? localEdits[`${course.course_id}_course_name`]
                                  : course.course_name || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'course_name', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.course_name || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-28 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_degree_name`] !== undefined
                                  ? localEdits[`${course.course_id}_degree_name`]
                                  : course.degree_name || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'degree_name', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.degree_name || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-48 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_specialization`] !== undefined
                                  ? localEdits[`${course.course_id}_specialization`]
                                  : course.specialization || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'specialization', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.specialization || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-40 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_stream`] !== undefined
                                  ? localEdits[`${course.course_id}_stream`]
                                  : course.stream || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'stream', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.stream || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-24 align-top">
                            {isEditing ? (
                              <select
                                value={localEdits[`${course.course_id}_level`] !== undefined
                                  ? localEdits[`${course.course_id}_level`]
                                  : course.level || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'level', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              >
                                <option value="">Select</option>
                                <option value="UG">UG</option>
                                <option value="PG">PG</option>
                                <option value="Diploma">Diploma</option>
                                <option value="PhD">PhD</option>
                              </select>
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.level || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-24 align-top">
                            {isEditing ? (
                              <select
                                value={localEdits[`${course.course_id}_study_mode`] !== undefined
                                  ? localEdits[`${course.course_id}_study_mode`]
                                  : course.study_mode || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'study_mode', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              >
                                <option value="">Select</option>
                                <option value="Regular">Regular</option>
                                <option value="Online">Online</option>
                              </select>
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.study_mode || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-24 align-top">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.status === 'Active'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                              {course.status || 'Unknown'}
                            </span>
                          </td>

                          <td className="px-3 py-3 w-32 align-top">
                            {isEditing ? (
                              <input
                                type="number"
                                value={localEdits[`${course.course_id}_total_fees`] !== undefined
                                  ? localEdits[`${course.course_id}_total_fees`]
                                  : course.total_fees || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'total_fees', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <span className="font-mono text-sm font-semibold text-gray-900">
                                ₹{Number(course.total_fees || 0).toLocaleString()}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 w-32 align-top">
                            {isEditing ? (
                              <input
                                type="number"
                                value={localEdits[`${course.course_id}_annual_fees`] !== undefined
                                  ? localEdits[`${course.course_id}_annual_fees`]
                                  : course.annual_fees || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'annual_fees', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <span className="font-mono text-sm font-semibold text-gray-900">
                                ₹{Number(course.annual_fees || 0).toLocaleString()}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 w-36 align-top">
                            {isEditing ? (
                              <input
                                type="number"
                                value={localEdits[`${course.course_id}_semester_fees`] !== undefined
                                  ? localEdits[`${course.course_id}_semester_fees`]
                                  : course.semester_fees || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'semester_fees', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <span className="font-mono text-sm font-semibold text-gray-900">
                                ₹{Number(course.semester_fees || 0).toLocaleString()}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 w-24 align-top">
                            {isEditing ? (
                              <input
                                type="number"
                                value={localEdits[`${course.course_id}_duration`] !== undefined
                                  ? localEdits[`${course.course_id}_duration`]
                                  : course.duration || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'duration', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.duration || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-32 align-top">
                            {isEditing ? (
                              <select
                                value={localEdits[`${course.course_id}_duration_type`] !== undefined
                                  ? localEdits[`${course.course_id}_duration_type`]
                                  : course.duration_type || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'duration_type', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              >
                                <option value="Years">Years</option>
                                <option value="Months">Months</option>
                                <option value="Semesters">Semesters</option>
                              </select>
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.duration_type || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-28 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_university_state`] !== undefined
                                  ? localEdits[`${course.course_id}_university_state`]
                                  : course.university_state || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'university_state', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.university_state || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-28 align-top">
                            {isEditing ? (
                              <input
                                type="text"
                                value={localEdits[`${course.course_id}_university_city`] !== undefined
                                  ? localEdits[`${course.course_id}_university_city`]
                                  : course.university_city || ''}
                                onChange={(e) => handleInputChange(course.course_id, 'university_city', e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                                {course.university_city || '-'}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 w-40 align-top">
                            <div className="text-sm font-medium text-gray-900 cursor-pointer p-1 rounded">
                              {course.brochure_url ? (
                                <a href={course.brochure_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
                                  📄 Brochure
                                </a>
                              ) : 'No File'}
                            </div>
                          </td>

                          <td className="px-3 py-3 w-32 align-top">
                            <div
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors p-1 rounded underline hover:bg-blue-50"
                              onClick={() => openModal(course.course_id, 'usp', course.usp)}
                            >
                              {formatArrayField(course.usp)}
                            </div>
                          </td>

                          <td className="px-3 py-3 w-40 align-top">
                            <div
                              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors p-1 rounded underline hover:bg-blue-50"
                              onClick={() => openModal(course.course_id, 'eligibility', course.eligibility)}
                            >
                              {formatArrayField(course.eligibility)}
                            </div>
                          </td>

                          <td className="px-3 py-3 w-20 align-top">
                            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${course.hasApiMapping
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-500'
                              }`}>
                              {course.hasApiMapping ? '✓' : '○'}
                            </span>
                          </td>

                          <td className="px-3 py-3 w-40 align-top">
                            <div className="flex gap-1">
                              <button
                                onClick={() => isEditing ? handleSaveChanges(course.course_id) : onToggleEdit(course.course_id)}
                                className={`p-1.5 rounded-md transition-all flex items-center justify-center text-xs ${isEditing
                                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                  }`}
                                title={isEditing ? 'Save Changes' : 'Edit Row'}
                              >
                                {isEditing ?
                                  <CheckCircle className="w-3.5 h-3.5" /> :
                                  <Edit2 className="w-3.5 h-3.5" />
                                }
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentCourseId(course.course_id);
                                  setShowBrochureModal(true);
                                }}
                                className="p-1.5 rounded-md transition-all hover:shadow-sm text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-900"
                                title="Upload Brochure"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onToggleStatus(course.course_id, course.status)}
                                className={`p-1.5 rounded-md transition-all hover:shadow-sm text-xs ${course.status === 'Active'
                                  ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-900'
                                  : 'bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900'
                                  }`}
                                title={course.status === 'Active' ? 'Deactivate' : 'Activate'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredCourses.length === 0 && !loading && (
                <div className="text-center py-16 border-t border-gray-100">
                  <p className="text-xl text-gray-500 font-medium mb-2">
                    {searchCourse ? 'No courses found matching your search' : 'No courses found'}
                  </p>
                  <p className="text-gray-400">This university has no courses mapped yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* USP MODAL */}
      {showUspModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Edit Unique Selling Points (USP)
                </h2>
                <button
                  onClick={() => {
                    setShowUspModal(false);
                    setModalPoints([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">Add multiple USP points. Press Ctrl+Enter to add each point.</p>

              <div className="space-y-3 mb-6">
                {modalPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 flex-1 font-medium">{point}</span>
                    <button
                      onClick={() => setModalPoints(prev => prev.filter((_, i) => i !== index))}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <input
                  type="text"
                  placeholder="Type USP point and press Ctrl+Enter to add"
                  onKeyDown={handleKeyDown}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter (⌃+↵) to add point</p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowUspModal(false);
                  setModalPoints([]);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveModalPoints}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save USP Points
              </button>
            </div>
          </div>
        </div>
      )}

      {currentCourseId && (
        <BrochureModal
          course={courses.find(c => c.course_id === currentCourseId)}
          brochureFile={brochureFile}
          setBrochureFile={setBrochureFile}
          loading={loading}
          onConfirm={() => onUpdateBrochure(currentCourseId)}
          onCancel={() => {
            setShowBrochureModal(false);
            setBrochureFile(null);
            setCurrentCourseId(null);
          }}
        />
      )}

      {showBulkUploadModal && (
        <BulkUploadModal
          universities={[]}
          selectedUniversity={university}
          bulkUploadFile={bulkUploadFile}
          setBulkUploadFile={setBulkUploadFile}
          selectedBulkUniversity={selectedBulkUniversity}
          setSelectedBulkUniversity={setSelectedBulkUniversity}
          loading={bulkUploadLoading}
          onConfirm={onBulkUpload}
          onCancel={() => {
            setShowBulkUploadModal(false);
            setBulkUploadFile(null);
            setSelectedBulkUniversity('');
          }}
          onDownloadTemplate={onExport}
        />
      )}
      
      {/* ELIGIBILITY MODAL */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Edit Eligibility Criteria
                </h2>
                <button
                  onClick={() => {
                    setShowEligibilityModal(false);
                    setModalPoints([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">Add multiple eligibility criteria. Press Ctrl+Enter to add each criterion.</p>

              <div className="space-y-3 mb-6">
                {modalPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 flex-1 font-medium">{point}</span>
                    <button
                      onClick={() => setModalPoints(prev => prev.filter((_, i) => i !== index))}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <input
                  type="text"
                  placeholder="Type eligibility criterion and press Ctrl+Enter to add"
                  onKeyDown={handleKeyDown}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter (⌃+↵) to add criterion</p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowEligibilityModal(false);
                  setModalPoints([]);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveModalPoints}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Eligibility Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPDATE MODAL */}
      {showBulkUpdateModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowBulkUpdateModal(false);
            setBulkUpdates({ brochure: null, usp: [], eligibility: [] });
          }}
          onConfirm={() => onBulkUpdate(university.university_name)}
          title={`Bulk Update for ${university.university_name}`}
          confirmText={`Apply to All ${courses.length} Courses`}
          cancelText="Cancel"
          confirmColor="blue"
          icon={Settings}
          iconColor="purple"
          size="2xl"
          height="lg"
          confirmDisabled={!bulkUpdates.brochure && bulkUpdates.usp.length === 0 && bulkUpdates.eligibility.length === 0}
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Brochure
              </h3>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleBulkFileUpload}
                    className="hidden"
                    id="bulk-brochure"
                  />
                  <label
                    htmlFor="bulk-brochure"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      {bulkUpdates.brochure ? bulkUpdates.brochure.name : 'Upload brochure file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, or images (Max: 10MB)
                    </p>
                  </label>
                </div>
                {bulkUpdates.brochure && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bulkUpdates.brochure.name}</p>
                        <p className="text-xs text-gray-500">
                          {(bulkUpdates.brochure.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearBulkFile}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Unique Selling Points (USP)
              </h3>
              <div className="space-y-3 mb-4">
                {bulkUpdates.usp.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 flex-1 font-medium">{point}</span>
                    <button
                      onClick={() => removeBulkUspPoint(index)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type USP point and press Ctrl+Enter to add"
                value={bulkUspInput}
                onChange={(e) => setBulkUspInput(e.target.value)}
                onKeyDown={handleBulkUspKeyDown}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter (⌃+↵) to add point</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Eligibility Criteria
              </h3>
              <div className="space-y-3 mb-4">
                {bulkUpdates.eligibility.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 flex-1 font-medium">{point}</span>
                    <button
                      onClick={() => removeBulkEligibilityPoint(index)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type eligibility criterion and press Ctrl+Enter to add"
                value={bulkEligibilityInput}
                onChange={(e) => setBulkEligibilityInput(e.target.value)}
                onKeyDown={handleBulkEligibilityKeyDown}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter (⌃+↵) to add criterion</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ConfirmDisableModal = ({ university, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(university.university_name, university.active_courses > 0 ? 'Active' : 'Inactive');
      onCancel();
    } catch (error) {
      console.error('Error toggling courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title="Toggle University Status"
      confirmText={university.active_courses > 0 ? 'Disable All Courses' : 'Enable All Courses'}
      cancelText="Cancel"
      confirmColor={university.active_courses > 0 ? 'red' : 'green'}
      icon={Power}
      iconColor={university.active_courses > 0 ? 'red' : 'green'}
      size="md"
      loading={isLoading}
      loadingText="Processing..."
    >
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-lg">
              {university.university_name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{university.university_name}</div>
            <div className="text-sm text-gray-600">
              {university.total_courses || 0} total courses
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              ⚠️
            </div>
            <div>
              <p className="font-medium text-yellow-800">Are you sure?</p>
              <p className="text-sm text-yellow-700 mt-1">
                This will {university.active_courses > 0 ? 'disable' : 'enable'} all {university.total_courses || 0} courses for {university.university_name}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Currently Active</div>
            <div className="text-lg font-bold text-green-600">{university.active_courses || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-600">Will Become</div>
            <div className="text-lg font-bold text-red-600">{university.active_courses > 0 ? 'Inactive' : 'Active'}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AddCourseModal = ({ universities, selectedUniversity, newCourse, setNewCourse, onConfirm, onCancel }) => {
  const [useExistingUniversity, setUseExistingUniversity] = useState(!!selectedUniversity);
  const [customUniversityName, setCustomUniversityName] = useState('');
  const [selectedUniversityName, setSelectedUniversityName] = useState(selectedUniversity?.university_name || '');

  const handleInputChange = (field, value) => {
    setNewCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    if (useExistingUniversity) {
      if (!selectedUniversityName) {
        alert('Please select a university');
        return;
      }
      newCourse.university_name = selectedUniversityName;
    } else {
      if (!customUniversityName.trim()) {
        alert('Please enter a university name');
        return;
      }
      newCourse.university_name = customUniversityName.trim();
    }

    onConfirm();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title="Add New Course"
      confirmText="Add Course"
      cancelText="Cancel"
      confirmColor="green"
      icon={Plus}
      iconColor="green"
      size="2xl"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            University *
          </label>

          {!selectedUniversity && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="use-existing"
                  checked={useExistingUniversity}
                  onChange={() => setUseExistingUniversity(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="use-existing" className="text-sm text-gray-700">
                  Select from existing universities
                </label>
              </div>

              {useExistingUniversity && (
                <select
                  value={selectedUniversityName}
                  onChange={(e) => setSelectedUniversityName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ml-7"
                  required
                >
                  <option value="">Select University</option>
                  {universities.map(uni => (
                    <option key={uni.university_name} value={uni.university_name}>
                      {uni.university_name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="use-custom"
                  checked={!useExistingUniversity}
                  onChange={() => setUseExistingUniversity(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="use-custom" className="text-sm text-gray-700">
                  Enter new university name
                </label>
              </div>

              {!useExistingUniversity && (
                <input
                  type="text"
                  value={customUniversityName}
                  onChange={(e) => setCustomUniversityName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ml-7"
                  placeholder="Enter university name"
                  required
                />
              )}
            </div>
          )}

          {selectedUniversity && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">
                  {selectedUniversity.university_name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{selectedUniversity.university_name}</div>
                <div className="text-sm text-gray-600">
                  {selectedUniversity.total_courses || 0} total courses
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={newCourse.course_name}
              onChange={(e) => handleInputChange('course_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter course name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree Name *
            </label>
            <input
              type="text"
              value={newCourse.degree_name}
              onChange={(e) => handleInputChange('degree_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., B.Tech, MBA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={newCourse.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <input
              type="text"
              value={newCourse.stream}
              onChange={(e) => handleInputChange('stream', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              value={newCourse.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select Level</option>
              <option value="UG">Undergraduate</option>
              <option value="PG">Postgraduate</option>
              <option value="Diploma">Diploma</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Mode *
            </label>
            <select
              value={newCourse.study_mode}
              onChange={(e) => handleInputChange('study_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select Mode</option>
              <option value="Regular">Regular</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <input
              type="number"
              value={newCourse.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., 4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration Type *
            </label>
            <select
              value={newCourse.duration_type}
              onChange={(e) => handleInputChange('duration_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="Years">Years</option>
              <option value="Months">Months</option>
              <option value="Semesters">Semesters</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Fees (₹)
            </label>
            <input
              type="number"
              value={newCourse.total_fees}
              onChange={(e) => handleInputChange('total_fees', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., 200000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Fees (₹)
            </label>
            <input
              type="number"
              value={newCourse.annual_fees}
              onChange={(e) => handleInputChange('annual_fees', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., 50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester Fees (₹)
            </label>
            <input
              type="number"
              value={newCourse.semester_fees}
              onChange={(e) => handleInputChange('semester_fees', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., 25000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University State
            </label>
            <input
              type="text"
              value={newCourse.university_state}
              onChange={(e) => handleInputChange('university_state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Maharashtra"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University City
            </label>
            <input
              type="text"
              value={newCourse.university_city}
              onChange={(e) => handleInputChange('university_city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Mumbai"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={newCourse.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

const BulkUploadModal = ({ universities, selectedUniversity, bulkUploadFile, setBulkUploadFile, selectedBulkUniversity, setSelectedBulkUniversity, loading, onConfirm, onCancel, onDownloadTemplate }) => {
  const fileInputRef = useRef(null);
  const [useExistingUniversity, setUseExistingUniversity] = useState(!!selectedUniversity);
  const [customUniversityName, setCustomUniversityName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkUploadFile(file);
    }
  };

  const clearFile = () => {
    setBulkUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (useExistingUniversity) {
      if (!selectedBulkUniversity && !selectedUniversity) {
        alert('Please select a university');
        return;
      }
      setSelectedBulkUniversity(selectedBulkUniversity || selectedUniversity?.university_name);
    } else {
      if (!customUniversityName.trim()) {
        alert('Please enter a university name');
        return;
      }
      setSelectedBulkUniversity(customUniversityName.trim());
    }

    onConfirm();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title="Bulk Upload Courses"
      confirmText="Upload Courses"
      cancelText="Cancel"
      confirmColor="blue"
      icon={Upload}
      iconColor="purple"
      size="lg"
      loading={loading}
      loadingText="Uploading..."
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with course data. The file should include required fields.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              University Selection
            </label>

            {!selectedUniversity && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="bulk-use-existing"
                    checked={useExistingUniversity}
                    onChange={() => setUseExistingUniversity(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="bulk-use-existing" className="text-sm text-gray-700">
                    Select from existing universities
                  </label>
                </div>

                {useExistingUniversity && (
                  <select
                    value={selectedBulkUniversity}
                    onChange={(e) => setSelectedBulkUniversity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ml-7"
                  >
                    <option value="">Select University (Optional)</option>
                    {universities.map(uni => (
                      <option key={uni.university_name} value={uni.university_name}>
                        {uni.university_name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="bulk-use-custom"
                    checked={!useExistingUniversity}
                    onChange={() => setUseExistingUniversity(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="bulk-use-custom" className="text-sm text-gray-700">
                    Enter new university name
                  </label>
                </div>

                {!useExistingUniversity && (
                  <input
                    type="text"
                    value={customUniversityName}
                    onChange={(e) => setCustomUniversityName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ml-7"
                    placeholder="Enter university name"
                  />
                )}
              </div>
            )}

            {selectedUniversity && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {selectedUniversity.university_name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUniversity.university_name}</div>
                  <div className="text-sm text-gray-600">
                    Courses will be added to this university
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2 ml-7">
              {!selectedUniversity && "Leave empty if CSV includes university_name column"}
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {bulkUploadFile ? bulkUploadFile.name : 'Click to upload file'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CSV or Excel files only (Max: 10MB)
              </p>
            </label>
          </div>

          {bulkUploadFile && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{bulkUploadFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(bulkUploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Required Fields in CSV:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
            <li>course_name</li>
            <li>university_name (if not selecting university above)</li>
            <li>degree_name</li>
            <li>level</li>
            <li>study_mode</li>
            <li>duration</li>
            <li>duration_type</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Optional fields: specialization, stream, total_fees, annual_fees, semester_fees,
            university_state, university_city, status (default: Active)
          </p>
          <button
            onClick={onDownloadTemplate}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download Template CSV
          </button>
        </div>
      </div>
    </Modal>
  );
};

const UniversityBrochureModal = ({ university, brochureFile, setBrochureFile, loading, onConfirm, onCancel }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setBrochureFile(file);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Upload University Brochure"
      confirmText="Upload Brochure"
      cancelText="Cancel"
      confirmColor="blue"
      icon={FileText}
      iconColor="indigo"
      size="md"
      loading={loading}
      loadingText="Uploading..."
      confirmDisabled={!brochureFile}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-lg">
              {university.university_name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{university.university_name}</div>
            <div className="text-sm text-gray-600">
              {university.total_courses || 0} total courses
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="university-brochure"
            />
            <label
              htmlFor="university-brochure"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {brochureFile ? brochureFile.name : 'Click to upload PDF brochure'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF files only (Max: 10MB)
              </p>
            </label>
          </div>
          
          {brochureFile && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{brochureFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(brochureFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setBrochureFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-yellow-800">Important</p>
              <p className="text-sm text-yellow-700 mt-1">
                This brochure will be associated with the entire university and will be available for all courses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CourseManagement;