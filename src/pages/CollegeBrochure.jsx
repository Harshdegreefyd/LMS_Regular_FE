import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Button, Card, Typography, Space, Tag, message,
  Input, Badge, Spin, List, Avatar, Divider,
  Menu, Dropdown, Layout, Drawer, Table,
  Tooltip, Radio, Slider, Tabs, Segmented
} from 'antd';
import {
  FilePdfOutlined, DownloadOutlined,
  ArrowLeftOutlined, BookOutlined,
  SearchOutlined, CheckCircleOutlined,
  EyeOutlined, AppstoreOutlined,
  UnorderedListOutlined, FilterOutlined,
  CloseOutlined, InfoCircleOutlined,
  RightOutlined, LeftOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, FullscreenOutlined,
  ReloadOutlined, SortAscendingOutlined,
  ZoomInOutlined, ZoomOutOutlined,
  MinusOutlined, PlusOutlined,
  BankOutlined, TeamOutlined
} from '@ant-design/icons';
import * as courseApi from '../network/courseHeaderValue';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const CollegeBrochure = () => {
  const navigate = useNavigate();
  const { universityName } = useParams();
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Course search states
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSearchValue, setCourseSearchValue] = useState('');

  // University search states
  const [uniSearch, setUniSearch] = useState('');
  const [uniSearchValue, setUniSearchValue] = useState('');

  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({ hasBrochure: null });
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUniversityList, setShowUniversityList] = useState(true);
  const [sortOrder, setSortOrder] = useState('brochure');
  const [zoomLevel, setZoomLevel] = useState(50);
  const [activeTab, setActiveTab] = useState('courses');

  // Use refs to track search timeouts
  const courseSearchTimeoutRef = useRef(null);
  const uniSearchTimeoutRef = useRef(null);

  const sortUniversities = useCallback((universitiesList, order) => {
    const sorted = [...universitiesList];

    switch (order) {
      case 'brochure':
        return sorted.sort((a, b) => {
          const aBrochures = a.active_courses || 0;
          const bBrochures = b.active_courses || 0;
          if (bBrochures !== aBrochures) {
            return bBrochures - aBrochures;
          }
          return a.university_name?.localeCompare(b.university_name || '');
        });

      case 'name':
        return sorted.sort((a, b) =>
          a.university_name?.localeCompare(b.university_name || '')
        );

      case 'courses':
        return sorted.sort((a, b) => {
          const aCourses = a.total_courses || 0;
          const bCourses = b.total_courses || 0;
          if (bCourses !== aCourses) {
            return bCourses - aCourses;
          }
          return a.university_name?.localeCompare(b.university_name || '');
        });

      default:
        return sorted;
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (universityName && universities.length > 0) {
      const decodedName = decodeURIComponent(universityName);
      const university = universities.find(u => u.university_name === decodedName);
      if (university) {
        handleUniversitySelection(decodedName, false);
      } else {
        setShowUniversityList(true);
        setSelectedUniversity(null);
      }
    } else if (!universityName) {
      setShowUniversityList(true);
      setSelectedUniversity(null);
    }
  }, [universityName, universities]);

  // Filter courses - memoized to prevent unnecessary re-renders
  const filterCourses = useCallback((searchValue = courseSearch, filterState = filters) => {
    let filtered = [...courses];

    if (searchValue.trim()) {
      const searchText = searchValue.toLowerCase().trim();
      filtered = filtered.filter(course => {
        const fields = [
          course.course_name?.toLowerCase() || '',
          course.specialization?.toLowerCase() || '',
          course.degree_name?.toLowerCase() || '',
          course.stream?.toLowerCase() || '',
          course.course_code?.toLowerCase() || ''
        ];
        return fields.some(field => field.includes(searchText));
      });
    }

    if (filterState.hasBrochure !== null) {
      filtered = filtered.filter(course =>
        filterState.hasBrochure ? !!course.brochure_url : !course.brochure_url
      );
    }

    return filtered;
  }, [courses, filters]);

  // Filter universities - memoized
  const filterUniversities = useCallback((searchValue = uniSearch) => {
    let filtered = [...universities];

    if (searchValue.trim()) {
      const searchText = searchValue.toLowerCase().trim();
      filtered = filtered.filter(uni =>
        uni.university_name?.toLowerCase().includes(searchText)
      );
    }

    return sortUniversities(filtered, sortOrder);
  }, [universities, sortOrder, sortUniversities]);

  // Course search handler with debounce
  const handleCourseSearchChange = useCallback((value) => {
    setCourseSearchValue(value);

    // Clear previous timeout
    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    courseSearchTimeoutRef.current = setTimeout(() => {
      setCourseSearch(value);
      const filtered = filterCourses(value);
      setFilteredCourses(filtered);
    }, 300); // 300ms debounce
  }, [filterCourses]);

  // University search handler with debounce
  const handleUniSearchChange = useCallback((value) => {
    setUniSearchValue(value);

    // Clear previous timeout
    if (uniSearchTimeoutRef.current) {
      clearTimeout(uniSearchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    uniSearchTimeoutRef.current = setTimeout(() => {
      setUniSearch(value);
      const filtered = filterUniversities(value);
      setFilteredUniversities(filtered);
    }, 300); // 300ms debounce
  }, [filterUniversities]);

  // Manual search button handlers
  const handleCourseSearchApply = useCallback(() => {
    // Clear any pending timeout
    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }

    setCourseSearch(courseSearchValue);
    const filtered = filterCourses(courseSearchValue);
    setFilteredCourses(filtered);
  }, [courseSearchValue, filterCourses]);

  const handleUniSearchApply = useCallback(() => {
    // Clear any pending timeout
    if (uniSearchTimeoutRef.current) {
      clearTimeout(uniSearchTimeoutRef.current);
    }

    setUniSearch(uniSearchValue);
    const filtered = filterUniversities(uniSearchValue);
    setFilteredUniversities(filtered);
  }, [uniSearchValue, filterUniversities]);

  // Clear search functions
  const handleCourseSearchClear = useCallback(() => {
    setCourseSearchValue('');
    setCourseSearch('');
    setFilteredCourses(filterCourses(''));

    // Clear timeout if exists
    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }
  }, [filterCourses]);

  const handleUniSearchClear = useCallback(() => {
    setUniSearchValue('');
    setUniSearch('');
    setFilteredUniversities(filterUniversities(''));

    // Clear timeout if exists
    if (uniSearchTimeoutRef.current) {
      clearTimeout(uniSearchTimeoutRef.current);
    }
  }, [filterUniversities]);

  // Handle Enter key press - clear any pending timeouts
  const handleCourseSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      if (courseSearchTimeoutRef.current) {
        clearTimeout(courseSearchTimeoutRef.current);
      }
      handleCourseSearchApply();
    }
  }, [handleCourseSearchApply]);

  const handleUniSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      if (uniSearchTimeoutRef.current) {
        clearTimeout(uniSearchTimeoutRef.current);
      }
      handleUniSearchApply();
    }
  }, [handleUniSearchApply]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (courseSearchTimeoutRef.current) {
        clearTimeout(courseSearchTimeoutRef.current);
      }
      if (uniSearchTimeoutRef.current) {
        clearTimeout(uniSearchTimeoutRef.current);
      }
    };
  }, []);

  // Update filtered lists when dependencies change
  useEffect(() => {
    const filtered = filterCourses();
    setFilteredCourses(filtered);
  }, [courses, filters, filterCourses]);

  useEffect(() => {
    const filtered = filterUniversities();
    setFilteredUniversities(filtered);
  }, [universities, sortOrder, filterUniversities]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getAllUniversities();
      const uniList = Array.isArray(res.data.data) ? res.data.data : [];
      setUniversities(uniList);
      setFilteredUniversities(sortUniversities(uniList, sortOrder));
    } catch (error) {
      message.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleUniversitySelection = async (universityName, shouldNavigate = true) => {
    const university = universities.find(u => u.university_name === universityName);
    if (!university) return;

    // Clear search states and timeouts
    setCourseSearch('');
    setCourseSearchValue('');
    setUniSearch('');
    setUniSearchValue('');
    setFilters({ hasBrochure: null });

    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }
    if (uniSearchTimeoutRef.current) {
      clearTimeout(uniSearchTimeoutRef.current);
    }

    setSelectedUniversity(university);
    setSelectedCourse(null);
    setShowUniversityList(false);
    setSidebarCollapsed(false);
    setZoomLevel(50);
    setActiveTab('courses');
    await fetchCourses(universityName);

    if (shouldNavigate) {
      navigate(`/college-brochure/${encodeURIComponent(universityName)}`);
    }
  };

  const fetchCourses = async (universityName) => {
    setCoursesLoading(true);
    try {
      const res = await courseApi.getUniversityCourseMappings(universityName);
      const courseList = Array.isArray(res.data.data) ? res.data.data : [];

      const sortedCourses = [...courseList].sort((a, b) => {
        const aHasBrochure = a.brochure_url ? 1 : 0;
        const bHasBrochure = b.brochure_url ? 1 : 0;
        if (bHasBrochure !== aHasBrochure) {
          return bHasBrochure - aHasBrochure;
        }
        return a.course_name?.localeCompare(b.course_name || '');
      });

      setCourses(sortedCourses);
      setFilteredCourses(sortedCourses);

      const firstCourseWithBrochure = sortedCourses.find(c => c.brochure_url);
      if (firstCourseWithBrochure) {
        setSelectedCourse(firstCourseWithBrochure);
      } else if (sortedCourses.length > 0) {
        setSelectedCourse(sortedCourses[0]);
      }
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setZoomLevel(50);
    setActiveTab('courses');
    if (window.innerWidth < 768) {
      setMobileDrawerVisible(false);
    }
  };

  const downloadBrochure = async () => {
    if (!selectedCourse?.brochure_url && !selectedUniversity?.brochure_url) {
      message.error('No brochure available to download');
      return;
    }

    try {
      const url = activeTab === 'university' ? selectedUniversity.brochure_url : selectedCourse.brochure_url;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      if (activeTab === 'university') {
        link.download = `${selectedUniversity.university_name}_University_Brochure.pdf`.replace(/[^a-zA-Z0-9-_]/g, '_');
      } else {
        link.download = `${selectedCourse.course_name}_Course_Brochure.pdf`.replace(/[^a-zA-Z0-9-_]/g, '_');
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      message.success('Brochure download started');
    } catch (error) {
      console.error("Brochure download failed", error);
      message.error('Failed to download brochure');
    }
  };

  const openInNewTab = () => {
    const url = activeTab === 'university' ? selectedUniversity?.brochure_url : selectedCourse?.brochure_url;
    if (url) {
      window.open(url, '_blank');
      message.success('Opening brochure in new tab');
    }
  };

  const refreshPreview = () => {
    if (activeTab === 'university' && selectedUniversity?.brochure_url) {
      setSelectedUniversity({ ...selectedUniversity });
      message.success('Preview refreshed');
    } else if (selectedCourse?.brochure_url) {
      setSelectedCourse({ ...selectedCourse });
      message.success('Preview refreshed');
    }
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    const filtered = filterUniversities(uniSearch);
    setFilteredUniversities(filtered);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => Math.min(prev + 25, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 25) {
      setZoomLevel(prev => Math.max(prev - 25, 25));
    }
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const handleZoomChange = (value) => {
    setZoomLevel(value);
  };
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // 🚫 stop page reload
    console.log(search);
  };
  const handleClearAllFilters = useCallback(() => {
    setCourseSearch('');
    setCourseSearchValue('');
    setFilters({ hasBrochure: null });
    setFilteredCourses(filterCourses(''));

    // Clear timeout if exists
    if (courseSearchTimeoutRef.current) {
      clearTimeout(courseSearchTimeoutRef.current);
    }
  }, [filterCourses]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    const filtered = filterCourses(courseSearch, newFilters);
    setFilteredCourses(filtered);
  }, [courseSearch, filterCourses]);

  const UniversityListView = () => {
    const columns = [
      {
        title: 'University Name',
        dataIndex: 'university_name',
        key: 'university_name',
        sorter: (a, b) => a.university_name?.localeCompare(b.university_name || ''),
        render: (text, record) => (
          <div className="flex items-center gap-2">
            <Text strong>{text}</Text>
            {(record.active_courses > 0 || record.has_brochure) && (
              <FilePdfOutlined className="text-green-500 text-sm" />
            )}
          </div>
        ),
        width: '30%',
      },
      {
        title: 'Total',
        dataIndex: 'total_courses',
        key: 'total_courses',
        render: (count) => <Tag color="blue">{count || 0}</Tag>,
        width: '12%',
        align: 'center'
      },
      {
        title: 'Mapped',
        dataIndex: 'mapped_courses_count',
        key: 'mapped_courses_count',
        render: (count) => (
          <Badge
            count={count || 0}
            showZero
            style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
          />
        ),
        width: '12%',
        align: 'center'
      },
      {
        title: 'Inactive',
        dataIndex: 'inactive_courses',
        key: 'inactive_courses',
        render: (count) => (
          <Tag color={count > 0 ? 'orange' : 'green'}>
            {count || 0}
          </Tag>
        ),
        width: '12%',
        align: 'center'
      },
      {
        title: 'Action',
        key: 'action',
        width: '7%',
        render: (_, record) => (
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => handleUniversitySelection(record.university_name)}
            size="middle"
            className="w-full"
            disabled={!record.active_courses || record.active_courses === 0}
          >
            {record.active_courses > 0 ? 'View Courses' : 'No Courses'}
          </Button>
        ),
        align: 'center'
      },
    ];

    return (
      <div className="p-4 md:px-12 py-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6">
          <div className="flex-1">
            <Title level={2} className="m-0 text-xl md:text-2xl">
              College Brochure
            </Title>
            <Text type="secondary" className="mt-1 md:mt-2 block text-sm md:text-base">
              Select a university to view and download course brochures
            </Text>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center"
              >
                <input
                  type="text"
                  value={uniSearchValue}
                  onChange={(e) => setUniSearchValue(e.target.value)}
                  autoFocus
                  placeholder="Search university..."
                  className="
          w-full md:w-72
          px-4 py-2
          text-sm
          border border-gray-300
          rounded-lg
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100
        "
                />
              </form>

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleUniSearchApply}
                size="large"
                className="rounded-lg"
              >
                Search
              </Button>
            </div>

            {uniSearch && (
              <div className="mt-2 flex items-center gap-2">
                <Text type="secondary" className="text-sm">
                  Showing results for:{" "}
                  <span className="font-medium text-gray-700">
                    "{uniSearch}"
                  </span>
                </Text>
                <Button
                  type="link"
                  size="small"
                  onClick={handleUniSearchClear}
                  className="p-0"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

        </div>

        <Card
          title={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Space className="flex-wrap">
                <span className="text-base md:text-lg">Universities List</span>
                <Badge
                  count={filteredUniversities.length}
                  style={{ backgroundColor: '#1890ff' }}
                  className="text-xs md:text-sm"
                />
                {uniSearch && (
                  <Tag color="blue" className="ml-2">
                    Filtered
                  </Tag>
                )}
              </Space>

              <Dropdown
                overlay={
                  <Menu selectedKeys={[sortOrder]} onClick={(e) => handleSortChange(e.key)}>
                    <Menu.Item key="brochure">Sort by: Brochure Count</Menu.Item>
                    <Menu.Item key="name">Sort by: Name</Menu.Item>
                    <Menu.Item key="courses">Sort by: Total Courses</Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <Button icon={<SortAscendingOutlined />} size="middle">
                  Sort
                </Button>
              </Dropdown>
            </div>
          }
          className="rounded-lg shadow-sm"
        >
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={filteredUniversities}
              rowKey={(record) => record.university_name || Math.random().toString()}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => {
                  const withBrochures = universities.filter(u => u.active_courses > 0).length;
                  return (
                    <div className="flex flex-col gap-1">
                      <span>Showing {range[0]}-{range[1]} of {total} universities</span>
                      {uniSearch && (
                        <span className="text-blue-600 text-xs">
                          Search: "{uniSearch}"
                        </span>
                      )}
                    </div>
                  );
                },
                pageSizeOptions: ['10', '20', '50'],
                responsive: true,
                size: 'small'
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              className="min-w-full"
              rowClassName={(record) =>
                record.active_courses > 0 ? 'bg-gray-50 ' : 'bg-blue-50'
              }
            />
          </div>
        </Card>
      </div>
    );
  };

  const CourseSidebar = () => {
    const CourseItem = ({ course }) => (
      <div
        className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${selectedCourse?.course_id === course.course_id
          ? 'bg-blue-50 border-l-4 border-blue-500'
          : 'hover:bg-gray-50 border-l-4 border-transparent'
          } ${course.brochure_url ? 'border-r-2 border-r-green-200' : ''}`}
        onClick={() => handleCourseSelect(course)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Text strong className={`block ${selectedCourse?.course_id === course.course_id ? 'text-blue-600' : ''
              } ${course.brochure_url ? 'text-green-700' : 'text-gray-700'}`}>
              {course.course_name}
            </Text>
            {course.specialization && (
              <Text type="secondary" className="text-xs block mt-1">
                {course.specialization}
              </Text>
            )}
          </div>
          {course.brochure_url && (
            <div className="flex flex-col items-end gap-1">
              <Tag color="green" size="small" icon={<FilePdfOutlined />} />
              {selectedCourse?.course_id === course.course_id && (
                <RightOutlined className="text-blue-500 text-xs" />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Tag color="blue" size="small">
              {course.duration} {course.duration_type || 'Years'}
            </Tag>
            {course.annual_fees && (
              <Tag color="orange" size="small">
                ₹{parseInt(course.annual_fees).toLocaleString()}
              </Tag>
            )}
          </div>
          {!course.brochure_url && (
            <Tag color="default" size="small">No Brochure</Tag>
          )}
        </div>
      </div>
    );

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  navigate('/college-brochure');
                  setShowUniversityList(true);
                  setSelectedUniversity(null);
                }}
                className="p-0 mb-2"
              >
                Universities
              </Button>
              <Title level={4} className="mt-0 mb-1 text-lg truncate">
                {selectedUniversity?.university_name}
              </Title>
              <div className="flex items-center gap-2">
                <Badge
                  count={courses.filter(c => c.brochure_url).length}
                  style={{ backgroundColor: '#52c41a' }}
                  showZero
                />
                <Text type="secondary" className="text-xs">
                  of {courses.length} courses have brochures
                </Text>
              </div>
            </div>
          </div>

         <div className="space-y-4">
  {/* SEARCH BAR */}
  <div className="flex flex-col md:flex-row md:items-center gap-3">
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center w-full md:w-auto"
    >
      <div className="relative w-full md:w-52">
        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

        <input
          type="text"
          value={courseSearchValue}
          onChange={(e) => setCourseSearchValue(e.target.value)}
          autoFocus
          placeholder="Search courses..."
          className="
            w-full
            pl-9 pr-4 py-1.5
            text-sm
            border border-gray-300
            rounded
            bg-white
            shadow-sm
            outline-none
            transition-all
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
            hover:border-gray-400
          "
        />
      </div>
    </form>

    <Button
      type="primary"
      icon={<SearchOutlined />}
      onClick={handleCourseSearchApply}
      size="middle"
      className="rounded-xl px-6"
    >
      Search
    </Button>
  </div>

  {/* FILTERS & CONTROLS */}
  <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-xl">
    <Dropdown
      overlay={
        <Menu
          selectedKeys={
            filters.hasBrochure !== null
              ? [filters.hasBrochure.toString()]
              : []
          }
        >
          <Menu.Item key="all" onClick={() => handleFilterChange({ hasBrochure: null })}>
            All Courses ({courses.length})
          </Menu.Item>
          <Menu.Item key="true" onClick={() => handleFilterChange({ hasBrochure: true })}>
            With Brochure Only ({courses.filter(c => c.brochure_url).length})
          </Menu.Item>
          <Menu.Item key="false" onClick={() => handleFilterChange({ hasBrochure: false })}>
            Without Brochure ({courses.filter(c => !c.brochure_url).length})
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <Button size="small" icon={<FilterOutlined />} className="rounded-lg">
        {filters.hasBrochure === true
          ? 'With Brochure'
          : filters.hasBrochure === false
          ? 'Without Brochure'
          : 'Filter'}
      </Button>
    </Dropdown>

    <div className="flex gap-1">
      <Button
        size="small"
        type={viewMode === 'list' ? 'primary' : 'default'}
        icon={<UnorderedListOutlined />}
        onClick={() => setViewMode('list')}
        className="rounded-lg"
      />
      <Button
        size="small"
        type={viewMode === 'grid' ? 'primary' : 'default'}
        icon={<AppstoreOutlined />}
        onClick={() => setViewMode('grid')}
        className="rounded-lg"
      />
    </div>

    {(courseSearch || filters.hasBrochure !== null) && (
      <Button
        size="small"
        type="link"
        onClick={handleClearAllFilters}
        className="ml-auto text-blue-600"
      >
        Clear All
      </Button>
    )}

    <Text type="secondary" className="text-xs ml-auto">
      {filteredCourses.length} of {courses.length} courses
    </Text>
  </div>

  {/* ACTIVE SEARCH BADGE */}
  {courseSearch && (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-xl">
      <Text className="text-sm text-blue-700">
        Search: <span className="font-medium">"{courseSearch}"</span>
      </Text>
      <Button
        type="link"
        size="small"
        onClick={handleCourseSearchClear}
        className="p-0 text-blue-600"
      >
        Clear
      </Button>
    </div>
  )}
</div>

        </div>

        <div className="flex-1 overflow-auto p-4">
          {coursesLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin size="small" tip="Loading courses..." />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOutlined className="text-3xl text-gray-300 mb-3" />
              <Text type="secondary" className="block">No courses found</Text>
              <Text type="secondary" className="text-xs">
                {courseSearch ? `No courses match "${courseSearch}"` : 'Try adjusting your search or filters'}
              </Text>
              {(courseSearch || filters.hasBrochure !== null) && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleClearAllFilters}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-1">
              {filteredCourses.map(course => (
                <CourseItem key={course.course_id} course={course} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredCourses.map(course => (
                <Card
                  key={course.course_id}
                  size="small"
                  className={`cursor-pointer hover:shadow-md ${selectedCourse?.course_id === course.course_id
                    ? 'border-blue-500 border-2'
                    : course.brochure_url
                      ? 'border-green-200 border'
                      : ''
                    }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong className={`text-sm block ${course.brochure_url ? 'text-green-700' : 'text-gray-700'
                        }`}>
                        {course.course_name}
                      </Text>
                      {course.specialization && (
                        <Text type="secondary" className="text-xs block mt-1">
                          {course.specialization}
                        </Text>
                      )}
                    </div>
                    {course.brochure_url && (
                      <FilePdfOutlined className="text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Tag color="blue" size="small">
                      {course.duration}y
                    </Tag>
                    {course.annual_fees && (
                      <Text type="secondary" className="text-xs">
                        ₹{parseInt(course.annual_fees).toLocaleString('en-IN', {
                          maximumFractionDigits: 0
                        })}
                      </Text>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BrochurePreview = () => {
    if (!selectedUniversity) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <FilePdfOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={4} className="text-gray-500 mb-2">No University Selected</Title>
          <Text type="secondary" className="text-center">
            Select a university from the list to view brochures
          </Text>
        </div>
      );
    }

    const hasUniversityBrochure = selectedUniversity.has_brochure && selectedUniversity.brochure_url;
    const hasCourseBrochures = courses.filter(c => c.brochure_url).length > 0;

    const renderCoursePreview = () => {
      if (!selectedCourse) {
        return (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <BookOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={4} className="text-gray-500 mb-2">No Course Selected</Title>
            <Text type="secondary" className="text-center">
              Select a course from the list to view its brochure
            </Text>
          </div>
        );
      }

      return (
        <>
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
                <Button
                  type="text"
                  icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:block"
                />
              </Tooltip>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Text strong className="text-lg truncate">
                    {selectedCourse.course_name}
                  </Text>
                  <Tag color={selectedCourse.brochure_url ? "green" : "red"} size="small">
                    {selectedCourse.brochure_url ? 'Brochure Available' : 'No Brochure'}
                  </Tag>
                </div>
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="text-sm truncate">
                    {selectedUniversity?.university_name}
                  </Text>
                  {selectedCourse.specialization && (
                    <>
                      <Divider type="vertical" />
                      <Text type="secondary" className="text-sm">
                        {selectedCourse.specialization}
                      </Text>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedCourse.brochure_url && (
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                  <Tooltip title="Zoom Out">
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 25}
                      size="small"
                    />
                  </Tooltip>

                  <Tooltip title="Zoom Level">
                    <Dropdown
                      overlay={
                        <Menu style={{ width: 200, padding: 8 }}>
                          <div className="p-2">
                            <div className="flex justify-between mb-2">
                              <Text strong>Zoom: {zoomLevel}%</Text>
                              <Button
                                type="link"
                                size="small"
                                onClick={handleZoomReset}
                              >
                                Reset
                              </Button>
                            </div>
                            <Slider
                              min={25}
                              max={200}
                              step={25}
                              value={zoomLevel}
                              onChange={handleZoomChange}
                              marks={{
                                25: '25%',
                                50: '50%',
                                75: '75%',
                                100: '100%',
                                125: '125%',
                                150: '150%',
                                175: '175%',
                                200: '200%'
                              }}
                            />
                          </div>
                        </Menu>
                      }
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button type="text" size="small">
                        <Space size={2}>
                          <Text>{zoomLevel}%</Text>
                        </Space>
                      </Button>
                    </Dropdown>
                  </Tooltip>

                  <Tooltip title="Zoom In">
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                      size="small"
                    />
                  </Tooltip>
                </div>
              )}

              <Tooltip title="Download Brochure">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadBrochure}
                  disabled={!selectedCourse?.brochure_url}
                  size="middle"
                />
              </Tooltip>

              <Tooltip title="Open in New Tab">
                <Button
                  icon={<FullscreenOutlined />}
                  onClick={openInNewTab}
                  disabled={!selectedCourse?.brochure_url}
                  size="middle"
                />
              </Tooltip>

              <Tooltip title="Refresh Preview">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refreshPreview}
                  disabled={!selectedCourse?.brochure_url}
                  size="middle"
                />
              </Tooltip>

              <Button
                type="default"
                icon={<LeftOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                className="md:hidden"
                size="middle"
              />
            </div>
          </div>

          <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
            {selectedCourse.brochure_url ? (
              <div className="h-screen bg-white rounded-lg shadow-lg overflow-auto">
                <iframe
                  key={selectedCourse.brochure_url}
                  src={`${selectedCourse.brochure_url}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={`${selectedCourse.course_name} Brochure`}
                  className="w-1/3 h-full mx-auto"
                  style={{ border: "none" }}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
                <FilePdfOutlined className="text-6xl text-gray-300 mb-4" />
                <Title level={4} className="text-gray-500 mb-2">Brochure Not Available</Title>
                <Text type="secondary" className="text-center mb-6">
                  This course does not have a brochure available for preview
                </Text>
                <Button
                  type="default"
                  icon={<BookOutlined />}
                  onClick={() => setMobileDrawerVisible(true)}
                  className="w-full md:hidden"
                >
                  Browse Other Courses
                </Button>
              </div>
            )}
          </div>

          {selectedCourse.brochure_url && (
            <div className="p-3 border-t bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <Text type="secondary" className="text-sm">
                    Course brochure loaded • Zoom: {zoomLevel}%
                  </Text>
                </div>
                <Text type="secondary" className="text-xs">
                  {selectedCourse.duration} {selectedCourse.duration_type || 'Years'} •
                  {selectedCourse.annual_fees ? ` ₹${parseInt(selectedCourse.annual_fees).toLocaleString()}/year` : ''}
                </Text>
              </div>
            </div>
          )}
        </>
      );
    };

    const renderUniversityPreview = () => {
      if (!hasUniversityBrochure) {
        return (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <BankOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={4} className="text-gray-500 mb-2">University Brochure Not Available</Title>
            <Text type="secondary" className="text-center">
              This university does not have a general brochure available
            </Text>
          </div>
        );
      }

      return (
        <>
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
                <Button
                  type="text"
                  icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:block"
                />
              </Tooltip>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Text strong className="text-lg truncate">
                    {selectedUniversity.university_name}
                  </Text>
                  <Tag color="green" size="small">
                    University Brochure
                  </Tag>
                </div>
                <Text type="secondary" className="text-sm">
                  General University Brochure
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r pr-2 mr-2">
                <Tooltip title="Zoom Out">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 25}
                    size="small"
                  />
                </Tooltip>

                <Tooltip title="Zoom Level">
                  <Dropdown
                    overlay={
                      <Menu style={{ width: 200, padding: 8 }}>
                        <div className="p-2">
                          <div className="flex justify-between mb-2">
                            <Text strong>Zoom: {zoomLevel}%</Text>
                            <Button
                              type="link"
                              size="small"
                              onClick={handleZoomReset}
                            >
                              Reset
                            </Button>
                          </div>
                          <Slider
                            min={25}
                            max={200}
                            step={25}
                            value={zoomLevel}
                            onChange={handleZoomChange}
                            marks={{
                              25: '25%',
                              50: '50%',
                              75: '75%',
                              100: '100%',
                              125: '125%',
                              150: '150%',
                              175: '175%',
                              200: '200%'
                            }}
                          />
                        </div>
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button type="text" size="small">
                      <Space size={2}>
                        <Text>{zoomLevel}%</Text>
                      </Space>
                    </Button>
                  </Dropdown>
                </Tooltip>

                <Tooltip title="Zoom In">
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 200}
                    size="small"
                  />
                </Tooltip>
              </div>

              <Tooltip title="Download University Brochure">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadBrochure}
                  size="middle"
                />
              </Tooltip>

              <Tooltip title="Open in New Tab">
                <Button
                  icon={<FullscreenOutlined />}
                  onClick={openInNewTab}
                  size="middle"
                />
              </Tooltip>

              <Tooltip title="Refresh Preview">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refreshPreview}
                  size="middle"
                />
              </Tooltip>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
            <div className="h-screen bg-white rounded-lg shadow-lg overflow-auto">
              <iframe
                key={selectedUniversity.brochure_url}
                src={`${selectedUniversity.brochure_url}#toolbar=0&navpanes=0&scrollbar=1`}
                title={`${selectedUniversity.university_name} University Brochure`}
                className="w-1/3 h-full mx-auto"
                allowFullScreen
              />
            </div>
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <Text type="secondary" className="text-sm">
                  University brochure loaded • Zoom: {zoomLevel}%
                </Text>
              </div>
              <Text type="secondary" className="text-xs">
                General University Information
              </Text>
            </div>
          </div>
        </>
      );
    };

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-white">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="brochure-tabs"
          >
            <TabPane
              tab={
                <span>
                  <BookOutlined />
                  Course Brochures
                  {hasCourseBrochures && (
                    <Badge count={courses.filter(c => c.brochure_url).length} size="small" style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
                  )}
                </span>
              }
              key="courses"
            />
            <TabPane
              tab={
                <span>
                  <BankOutlined />
                  University Brochure
                  {hasUniversityBrochure && (
                    <Badge count={1} size="small" style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
                  )}
                </span>
              }
              key="university"
              disabled={!hasUniversityBrochure}
            />
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'courses' ? renderCoursePreview() : renderUniversityPreview()}
        </div>
      </div>
    );
  };

  if (showUniversityList || !selectedUniversity) {
    return <UniversityListView />;
  }

  return (
    <>
      <Layout className="h-screen pb-10">
        <Sider
          width={350}
          collapsed={sidebarCollapsed}
          collapsedWidth={0}
          className="hidden md:block border-r"
          theme="light"
          trigger={null}
          collapsible
        >
          <CourseSidebar />
        </Sider>

        <Drawer
          title={
            <div>
              <Text strong>{selectedUniversity?.university_name}</Text>
              <Text type="secondary" className="block text-xs">
                Select a course to view brochure
              </Text>
            </div>
          }
          placement="left"
          width={350}
          open={mobileDrawerVisible}
          onClose={() => setMobileDrawerVisible(false)}
          className="md:hidden"
        >
          <CourseSidebar />
        </Drawer>

        <Content className="h-full">
          <BrochurePreview />
        </Content>
      </Layout>
    </>
  );
};

export default CollegeBrochure;