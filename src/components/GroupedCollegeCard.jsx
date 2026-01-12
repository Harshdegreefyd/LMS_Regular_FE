import React, { useState } from 'react';
import CourseRow from './CourseRow';

const GroupedCollegeCard = ({ collegeGroup, studentId, onStatusChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const collegeInfo = collegeGroup[0];
    const [activeTab, setActiveTab] = useState('usp'); // 'usp' or 'eligibility'

    // Log the data as requested
    console.log(collegeInfo.usp, 'and', collegeInfo.eligibility);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header Section */}
            <div
                className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 cursor-pointer border-b border-blue-200"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <div className="bg-white rounded-full p-2 shadow-sm mr-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{collegeInfo.universityName}</h3>
                                <div className="flex items-center mt-1">
                                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-sm text-gray-600">{collegeInfo.city}, {collegeInfo.state}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="text-blue-600 font-semibold">
                                    {collegeGroup.length} {collegeGroup.length === 1 ? "Course" : "Courses"}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-full p-2 shadow-sm border border-blue-100 transition-transform duration-300 hover:scale-110">
                            <svg
                                className={`w-6 h-6 text-blue-600 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Content */}
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-auto opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {isExpanded && (
                    <div className="bg-gray-50">
                        {/* Split Screen Section - USP and Eligibility */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">University Information</h4>
                                <div className="flex border-b border-gray-200">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'usp' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setActiveTab('usp')}
                                    >
                                        USP (Unique Selling Points)
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'eligibility' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setActiveTab('eligibility')}
                                    >
                                        Eligibility Criteria
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* USP Section */}
                                <div className={`space-y-4 ${activeTab === 'usp' ? 'block' : 'hidden md:block'}`}>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-800 mb-1">University USPs</h5>
                                            {collegeInfo.usp && collegeInfo.usp.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {collegeInfo.usp.map((point, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="text-blue-500 mr-2">•</span>
                                                            <span className="text-gray-600 text-sm">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No USP information available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Eligibility Section */}
                                <div className={`space-y-4 ${activeTab === 'eligibility' ? 'block' : 'hidden md:block'}`}>
                                    <div className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-800 mb-1">General Eligibility</h5>
                                            {collegeInfo.eligibility && collegeInfo.eligibility.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {collegeInfo.eligibility.map((criteria, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="text-green-500 mr-2">•</span>
                                                            <span className="text-gray-600 text-sm">{criteria}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No eligibility information available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile View - Tab Content */}
                            <div className="mt-4 md:hidden">
                                {activeTab === 'usp' && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-800 mb-2">USP Details</h5>
                                        {collegeInfo.usp && collegeInfo.usp.length > 0 ? (
                                            <ul className="space-y-2">
                                                {collegeInfo.usp.map((point, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-blue-500 mr-2">•</span>
                                                        <span className="text-gray-600 text-sm">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No USP information available</p>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'eligibility' && (
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-800 mb-2">Eligibility Details</h5>
                                        {collegeInfo.eligibility && collegeInfo.eligibility.length > 0 ? (
                                            <ul className="space-y-2">
                                                {collegeInfo.eligibility.map((criteria, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <span className="text-gray-600 text-sm">{criteria}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No eligibility information available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Courses Table Section */}
                        <div className="p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Courses</h4>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span>Course</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span>Specialization</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span>Level</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span>Duration</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span className='text-nowrap'>Semester Fees</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span className='text-nowrap'>Annual Fees</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <span className='text-nowrap'>Total Fees</span>
                                            </th>
                                            <th className="py-3 px-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 102 0V4z" />
                                                    </svg>
                                                    <span>Action</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {collegeGroup.map((course, index) => (
                                            <tr
                                                key={course._id}
                                                className={`transition-colors duration-200 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <CourseRow
                                                    course={course}
                                                    studentId={studentId}
                                                    onStatusChange={onStatusChange}
                                                />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupedCollegeCard;