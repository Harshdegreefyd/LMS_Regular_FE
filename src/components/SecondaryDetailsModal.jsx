import React from "react";
import { X, Plus, Trash2, Mail, Phone, User } from "lucide-react";

const SecondaryDetailsModal = ({
  showModal,
  university,
  secondaryDetails,
  onClose,
  onAddRow,
  onRemoveRow,
  onDetailChange,
  onSave,
  loading,
  existingSecondaryCount
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Add Secondary Contact Details
              </h2>
              <p className="text-blue-100">
                {university?.universityName || "University"} requires additional contact information
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Existing Contacts Info */}
        {existingSecondaryCount > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-800 font-medium">
                  You have {existingSecondaryCount} saved contact{existingSecondaryCount > 1 ? 's' : ''}
                </p>
                <p className="text-emerald-600 text-sm">
                  These contacts are automatically loaded for your convenience
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                ℹ
              </span>
              Instructions
            </h3>
            <ul className="text-blue-700 text-sm space-y-1 list-disc pl-6">
              <li>Enter valid email addresses and 10-digit phone numbers</li>
              <li>You can add multiple contacts for the same university</li>
              <li>All contacts will be saved for future use</li>
              <li>Contacts are shared across all universities</li>
            </ul>
          </div>

          {/* Contact Details Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Contact #{existingSecondaryCount + 1} & onwards</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {secondaryDetails.map((detail, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-blue-50/50 transition-colors group"
                      style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td className="px-6 py-5 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-blue-700">
                              {existingSecondaryCount + index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Contact Person {existingSecondaryCount + index + 1}
                            </div>
                            <div className="text-sm text-gray-500">
                              Additional contact
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={detail.email}
                            onChange={(e) => onDetailChange(index, 'email', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="contact@example.com"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Phone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={detail.phone}
                            onChange={(e) => onDetailChange(index, 'phone', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="9876543210"
                            maxLength="10"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {secondaryDetails.length > 1 && (
                          <button
                            onClick={() => onRemoveRow(index)}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors group-hover:bg-red-100"
                            title="Remove contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add More Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onAddRow}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Another Contact
            </button>
          </div>

          {/* Validation Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email Validation</p>
                  <p className="text-sm text-gray-600">Must be a valid email format</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Phone Validation</p>
                  <p className="text-sm text-gray-600">10-digit number required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-gray-600">
            <p className="text-sm">
              {secondaryDetails.length} contact{secondaryDetails.length !== 1 ? 's' : ''} will be saved
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span>Save & Send to College</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryDetailsModal;