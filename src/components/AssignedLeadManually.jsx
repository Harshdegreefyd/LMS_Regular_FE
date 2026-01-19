import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { getAllCounsellors, assignCounsellorsToStudents } from '../network/counsellor'
import { Search, X, ChevronDown, User } from 'lucide-react'
const AssignedLeadManually = ({
    setIsAssignedtoL2,
    setIsAssignedtoL3,
    selectedStudent,
    isAssignedtoL3,
    isAssignedtoL2
}) => {
    const [counsellors, setCounsellors] = useState([])
    const [filteredCounsellors, setFilteredCounsellors] = useState([])
    const [selectedAgents, setSelectedAgents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [assignLoader, setassignLoader] = useState(false)
    const isL3Assignment = isAssignedtoL3
    const assignmentType = isL3Assignment ? 'L3' : 'L2'
    const targetRole = isL3Assignment ? 'l3' : 'l2'

    useEffect(() => {
        const fetchCounsellors = async () => {
            try {
                setLoading(true)
                const res = await getAllCounsellors()
                console.log(res)
                setCounsellors(res)
                setFilteredCounsellors(res)
            } catch (error) {
                console.error('Error fetching counsellors:', error)
                setCounsellors([])
                setFilteredCounsellors([])
            } finally {
                setLoading(false)
            }
        }

        fetchCounsellors()
    }, [targetRole])

    // Filter counsellors based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCounsellors(counsellors)
        } else {
            const filtered = counsellors.filter(counsellor =>
                counsellor.counsellor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                counsellor.counsellor_email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredCounsellors(filtered)
        }
    }, [searchTerm, counsellors])

    const handleAgentSelect = (agent) => {
        setSelectedAgents(prev => {
            const isAlreadySelected = prev.some(selected => selected.counsellor_id === agent.counsellor_id)
            if (isAlreadySelected) {
                return prev.filter(selected => selected.counsellor_id !== agent.counsellor_id)
            } else {
                return [...prev, agent]
            }
        })
    }

    const handleRemoveAgent = (agentId) => {
        setSelectedAgents(prev => prev.filter(agent => agent.counsellor_id !== agentId))
    }

    const handleAssign = async () => {
        try {

            setassignLoader(true)
            const assignmentData = {
                assignmentType,
                selectedStudents: selectedStudent.map(student => student.student_id),
                selectedAgents: selectedAgents.map(agent => ({
                    counsellorId: agent.counsellor_id,
                    name: agent.counsellor_name,
                    email: agent.counsellor_email
                }))

            };
            const response = await assignCounsellorsToStudents(assignmentData);
            const { updatedStudents } = response.data;

            if (response) {

                alert(`Successfully assigned ${selectedStudent.length} students to ${selectedAgents.length} ${assignmentType} counsellor(s)`);
                window.location.reload()
            } else {
                console.error('Assignment failed:', response.message);
                alert('Assignment failed: ' + response.message);
            }

        } catch (error) {
            console.error('Error during assignment:', error);
        } finally {

            if (isL3Assignment) {
                setIsAssignedtoL3(false);
            } else {
                setIsAssignedtoL2(false);
            }
            setassignLoader(false)
        }
    };

    const handleClose = () => {

        if (isL3Assignment) {

            setIsAssignedtoL3(false)
        } else {
            setIsAssignedtoL2(false)
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={handleClose}
            title={`Assign to ${assignmentType} Agent`}
            size="2xl"
            loading={assignLoader}
            loadingText={'Assigning...'}
            onConfirm={handleAssign}
            confirmText={`Assign to ${selectedAgents.length} Agent${selectedAgents.length !== 1 ? 's' : ''}`}
            cancelText="Cancel"
            confirmColor="blue"
        >
            <div className="space-y-6">
                {/* Assignment Info */}
                <p className="text-sm text-gray-600">
                    Select {assignmentType} agents to assign {selectedStudent?.length || 0} selected leads
                </p>

                {/* Selected Students Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                        Selected Leads ({selectedStudent?.length || 0})
                    </h3>
                    <div className="max-h-24 overflow-y-auto">
                        {selectedStudent?.map((student, index) => (
                            <div key={student.student_id || index} className="text-xs text-blue-800 py-1">
                                {student.student_name} - {student.student_id}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agent Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select {assignmentType} Agents
                    </label>

                    {/* Selected Agents */}

                    {selectedAgents.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedAgents.map((agent) => (
                                    <div
                                        key={agent.counsellor_id}
                                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                                    >
                                        <User size={14} className="mr-1" />
                                        {agent.counsellor_name}
                                        <button
                                            onClick={() => handleRemoveAgent(agent.counsellor_id)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <span className="text-gray-700">
                                {selectedAgents.length > 0
                                    ? `${selectedAgents.length} agent(s) selected`
                                    : `Select ${assignmentType} agents`
                                }
                            </span>
                            <ChevronDown
                                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                size={16}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                {/* Search Input at Top of Dropdown */}
                                <div className="p-3 border-b border-gray-200 bg-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder={`Search ${assignmentType} agents...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Dropdown Options */}
                                <div className="max-h-60 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                            <span className="block mt-2 text-sm">Loading agents...</span>
                                        </div>
                                    ) : filteredCounsellors.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            {searchTerm ? 'No agents found matching your search' : `No ${assignmentType} agents available`}
                                        </div>
                                    ) : (
                                        filteredCounsellors.map((counsellor) => {
                                            const isSelected = selectedAgents.some(agent => agent.counsellor_id === counsellor.counsellor_id)
                                            return (
                                                <div
                                                    key={counsellor.counsellor_id}
                                                    onClick={() => handleAgentSelect(counsellor)}
                                                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <User size={16} className="text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm">
                                                                {counsellor.counsellor_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {counsellor.counsellor_email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AssignedLeadManually