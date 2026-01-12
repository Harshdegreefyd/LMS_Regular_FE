
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddDirectStudent } from "../network/student";
import { fetchFilterOptions } from '../network/filterOptions';
import { useSelector } from "react-redux";

const AddLeadModal = ({ isOpen, onClose, onSuccess, agentID, defaultMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    source: "",
    referenceValue: "",
    selectedOtherSource: "", 
  });
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]); // For other source options
  const [loadingSources, setLoadingSources] = useState(false);

  const [selectedSource, setSelectedSource] = useState("student_ref");
  const roletosend = useSelector((state) => state.auth.user);
  console.log(roletosend)
  const sourceTypeOptions = roletosend.role == "Supervisor" ? ["counsellor_ref", "student_ref", "other"] : ["student_ref"];

  const isAgentMissing = roletosend?.id.includes("SUP") && !agentID;
  useEffect(() => {
    const fetchSources = async () => {
      if (selectedSource === "other") {
        setLoadingSources(true);
        try {
          const response = await fetchFilterOptions();
          setSourceOptions(response.data.source || []);
        } catch (error) {
          console.error("Error fetching source options:", error);
          setError("Failed to load source options");
        } finally {
          setLoadingSources(false);
        }
      }
    };

    fetchSources();
  }, [selectedSource]);

  const handleSourceChange = (e) => {
    const value = e.target.value;
    setSelectedSource(value);
    setFormData(prev => ({
      ...prev,
      source: value,
      referenceValue: "", // Reset reference value when source changes
      selectedOtherSource: "" // Reset other source selection
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone validation
    if (name === "phoneNumber") {
      // Remove non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      if (digitsOnly.length > 10) {
        setPhoneError("Phone number should be 10 digits only");
      } else {
        setPhoneError("");
      }

      // Update with digits only, limited to 10
      setFormData(prevState => ({
        ...prevState,
        // This line truncates the value to a maximum of 10 digits before updating the state.
        [name]: digitsOnly.slice(0, 10)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };


  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      source: "",
      referenceValue: "",
      selectedOtherSource: "",
    });
    setSelectedSource("counsellor_ref");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit if agent is missing
    if (isAgentMissing) return;

    // Validate phone number before submission
    if (formData.phoneNumber.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    // Validate reference value for student_ref and other
    if (selectedSource === "student_ref" && !formData.referenceValue.trim()) {
      setError("Student ID is required for student reference");
      return;
    }

    if (selectedSource === "other" && !formData.selectedOtherSource.trim()) {
      setError("Please select a source for other reference");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Prepare payload matching the API expectations
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        counselloridFe: JSON.parse(localStorage.getItem("agent"))?.counsellor_id || (roletosend?.role != "Supervisor" && roletosend?.id),
      };
      // Handle different source types
      if (selectedSource === "student_ref") {
        payload.source = selectedSource;
        payload.referenceFrom = formData.referenceValue; // studentId
      } else if (selectedSource === "other") {
        payload.source = formData.selectedOtherSource; // The selected source from dropdown
        payload.referenceFrom = "other"; // Pass "other" as referenceFrom
      } else {
        // counsellor_ref
        payload.source = selectedSource;
      }

      // Use the new API function
      const response = await AddDirectStudent(payload);

      setLoading(false);

      // Handle success - response structure: response.data.data contains the student data
      if (response.data?.success) {
        onSuccess(response.data);
        onClose();
        resetForm();

        // Navigate to student page if student_id is available
        if (response.data?.data?.studentId) {
          navigate(`/student/${response.data.data.studentId}`);
        }
      } else {
        throw new Error(response.data?.message || "Failed to add lead");
      }
    } catch (err) {
      setLoading(false);
      // Handle different error response structures
      const errorMessage = err.response?.data?.message ||
        err.data?.message ||
        err.message ||
        "Failed to add lead";
      setError(errorMessage);
      console.error("Error adding lead:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Modal content */}
      <div className="relative z-10 bg-white rounded-lg w-full max-w-xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Add New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Enter the details of the new lead below.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        {isAgentMissing && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded mb-4">
            Please select an agent first before adding a lead.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                placeholder="John Doe"
                required
                disabled={isAgentMissing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border-2 ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600`}
                placeholder="10-digit phone number"
                maxLength={10}
                required
                disabled={isAgentMissing}
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
              placeholder="john.doe@example.com"
              required
              disabled={isAgentMissing}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Source
            </label>
            <select
              value={selectedSource}
              onChange={handleSourceChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAgentMissing}
            >
              {sourceTypeOptions.map((source) => (
                <option key={source} value={source}>
                  {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Additional input for student_ref */}
          {selectedSource === "student_ref" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Student ID
              </label>
              <input
                type="text"
                name="referenceValue"
                value={formData.referenceValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                placeholder="Enter student ID (e.g., STD-12345678)"
                required
                disabled={isAgentMissing}
              />
            </div>
          )}

          {/* Additional dropdown for other source */}
          {selectedSource === "other" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Select Source
              </label>
              {loadingSources ? (
                <div className="w-full px-3 py-2 border-2 border-gray-300 rounded flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-2 text-gray-500">Loading sources...</span>
                </div>
              ) : (
                <select
                  name="selectedOtherSource"
                  value={formData.selectedOtherSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isAgentMissing}
                >
                  <option value="">Select a source</option>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-semibold bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded flex items-center ${isAgentMissing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={loading || isAgentMissing}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : isAgentMissing ? (
                "Select Agent First"
              ) : (
                "Add Lead"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;