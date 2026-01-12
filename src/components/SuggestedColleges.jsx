import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchStudentCourseStatus } from "../network/courseStudentStatus";
import GroupedCollegeCard from "./GroupedCollegeCard";
import { fetchShortlistedColleges } from '../network/colleges'
import Loader from "../common/Loader";
const SuggestedColleges = ({
  student
}) => {
  
  const { studentId } = useParams();
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [error,setCollegeError]=useState(null)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      const loadSuggestedColleges = async (studentData) => {
        if (!studentData) return
        
        try {
          setLoading(true)
          setCollegeError(null)
          const response = await fetchShortlistedColleges(studentData, 1, 100)
          setFilteredColleges(response.colleges || [])
        } catch (err) {
          console.error("Error fetching suggested colleges:", err)
          setCollegeError("Failed to fetch suggested colleges")
        } finally {
          setLoading(false)
        }
        
      }
      if (student) {
        loadSuggestedColleges(student)
      }
    }, [])
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [studentData, setStudentData] = useState(student || {});

  const PAGE_SIZE = 100;

  useEffect(() => {
    if (student) {
      setStudentData(student);
    }
  }, [studentId]);

  const checkShortlistedStatus = async (colleges) => {
    return Promise.all(
      colleges.map(async (college) => {
        try {
          const response = await fetchStudentCourseStatus(college.courseId, studentId);
          return {
            ...college,
            isShortlisted: response.success ? response.data.isShortlisted : false,
          };
        } catch (error) {
          console.error(`Error fetching status for college ${college._id}:`, error);
          return { ...college, isShortlisted: false };
        }
      })
    );
  };

  const fetchSuggestedColleges = async (studentPreferences, pageNum = 1, pageSize = 100) => {
    try {
      const response = await fetchShortlistedColleges(studentPreferences, pageNum, pageSize);
      return {
        colleges: response.courses || response.colleges || [],
        totalCount: response.totalCount || 0,
        hasMore: response.hasMore || response.totalCount > pageNum * pageSize
      };
    } catch (error) {
      console.error("Error fetching suggested colleges:", error);
      throw error;
    }
  };

useEffect(() => {
  if (!studentData) return;

  const initializeColleges = async () => {
    try {
      const response = await fetchSuggestedColleges(studentData);
      setFilteredColleges(response.colleges);
      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Error checking shortlisted status:", error);
      setFilteredColleges(initialColleges || []);
    }
  };

  initializeColleges();
}, [studentData]); 


  const loadMoreColleges = async () => {
    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetchSuggestedColleges(studentData, nextPage, PAGE_SIZE);
      setFilteredColleges(prev => [...prev, ...response.colleges]);
      setPage(nextPage);
      setHasMore(response.hasMore);
      setTotalCount(prev => prev + response.colleges.length);
    } catch (error) {
      console.error("Error loading more colleges:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const groupCollegesByName = (collegesList) => {
    const grouped = {};
    collegesList.forEach((college) => {
      const key = `${college.universityName}-${college.city}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(college);
    });
    return Object.values(grouped);
  };

  const handleStatusChange = (collegeId, newStatus) => {
    if (newStatus === "Shortlisted") {
      
      setFilteredColleges(prev => prev.filter(college => college.courseId !== collegeId));
      setTotalCount(prev => prev - 1);
    }

    onStatusChange?.(collegeId, newStatus);
  };
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg text-center max-w-3xl mx-auto my-8">
        <p className="text-lg font-medium">{error}</p>
        <p className="mt-2">Please try again later or contact support.</p>
      </div>
    );
  }
  if (!filteredColleges || filteredColleges.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-8 rounded-lg text-center max-w-3xl mx-auto my-8">
        <p className="text-lg font-medium">No suggested colleges found</p>
        <p className="mt-2">Try adjusting your preferences or search criteria.</p>
      </div>
    );
  }

  const groupedColleges = groupCollegesByName(filteredColleges);

  return (
    <div className=" mx-auto px-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Suggested Colleges</h2>
        {totalCount > 0 && (
          <span className="text-gray-600">
            Showing {Math.min(filteredColleges.length, totalCount)} courses
          </span>
        )}
      </div>

      <div className="space-y-2">
        {groupedColleges.map((group, index) => (
          <GroupedCollegeCard
            key={index}
            collegeGroup={group}
            studentId={studentId}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreColleges}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-blue-300"
            disabled={isFetchingMore}
          >
            {isFetchingMore ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Loading...
              </span>
            ) : (
              "Load More Colleges"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(SuggestedColleges);