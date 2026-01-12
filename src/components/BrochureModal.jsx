import { CheckCircle, Eye, FileText, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import Modal from "../common/Modal";

// Add this component after the other modal components
export const BrochureModal = ({
    course,
    brochureFile,
    setBrochureFile,
    loading,
    onConfirm,
    onCancel
}) => {
    const fileInputRef = useRef(null);
console.log("trigger",course)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid file (PDF, DOC, DOCX, JPEG, PNG)');
                return;
            }

            if (file.size > maxSize) {
                alert('File size should be less than 10MB');
                return;
            }

            setBrochureFile(file);
        }
    };

    const clearFile = () => {
        setBrochureFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            onConfirm={() => onConfirm(course.course_id)}
            title={`Upload Brochure for ${course.course_name}`}
            confirmText="Upload Brochure"
            cancelText="Cancel"
            confirmColor="blue"
            icon={FileText}
            iconColor="blue"
            size="md"
            loading={loading}
            loadingText="Uploading..."
            confirmDisabled={!brochureFile}
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                            {course.course_name.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{course.course_name}</div>
                        <div className="text-sm text-gray-600">{course.degree_name}</div>
                    </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="brochure-upload"
                    />
                    <label
                        htmlFor="brochure-upload"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700">
                            {brochureFile ? brochureFile.name : 'Click to upload brochure'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PDF, DOC, DOCX, JPEG, PNG (Max: 10MB)
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
                            onClick={clearFile}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-lg transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {course.brochure_url && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Current Brochure:</p>
                                <a
                                    href={course.brochure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:text-green-800 underline flex items-center gap-1 mt-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Current Brochure
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
