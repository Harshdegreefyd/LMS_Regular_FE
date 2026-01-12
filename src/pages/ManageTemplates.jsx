import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, FileText, RefreshCw, Edit, Save, X, Image, MapPin, File, Images } from 'lucide-react';
import { createTemplates, getTemplateById,HandleDelte, getTemplates, updateTemplate } from '../network/templates';

const CONTENT_TYPES = {
    IMAGE: 'image',
    CAROUSEL: 'carousel',
    PDF: 'pdf',
    LOCATION: 'location'
};

const ManageTemplates = () => {
    const [templates, setTemplates] = useState([{
        template_name: '',
        content_type: CONTENT_TYPES.IMAGE,
        image: null,
        imagePreview: '',
        carousel_images: [],
        carouselPreviews: [],
        pdf_file: null,
        pdfPreview: '',
        location_link: '',
        is_dynamic: false,
        placeholders: {}
    }]);
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState({});
    const [uploadingImages, setUploadingImages] = useState({});

    useEffect(() => {
        fetchExistingTemplates();
    }, []);

    const fetchExistingTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await getTemplates();
            if (response) {
                setExistingTemplates(response);
            } else {
                console.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...templates];
        if (field === 'content_type') {
            // Reset content when changing type
            updated[index] = {
                ...updated[index],
                [field]: value,
                image: null,
                imagePreview: '',
                carousel_images: [],
                carouselPreviews: [],
                pdf_file: null,
                pdfPreview: '',
                location_link: ''
            };
        } else {
            updated[index][field] = field === 'is_dynamic' ? value === 'true' : value;
        }
        setTemplates(updated);
    };

    const handlePlaceholderChange = (templateIndex, placeholderIndex, value) => {
        const updated = [...templates];
        updated[templateIndex].placeholders[placeholderIndex] = value;
        setTemplates(updated);
    };

    const addPlaceholder = (templateIndex) => {
        const updated = [...templates];
        const placeholderCount = Object.keys(updated[templateIndex].placeholders).length;
        if (placeholderCount < 10) {
            updated[templateIndex].placeholders[placeholderCount] = '';
            setTemplates(updated);
        }
    };

    const removePlaceholder = (templateIndex, placeholderIndex) => {
        const updated = [...templates];
        delete updated[templateIndex].placeholders[placeholderIndex];
        // Reindex placeholders
        const placeholders = Object.values(updated[templateIndex].placeholders);
        updated[templateIndex].placeholders = {};
        placeholders.forEach((value, index) => {
            updated[templateIndex].placeholders[index] = value;
        });
        setTemplates(updated);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = (index, file) => {
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const updated = [...templates];
            updated[index].image = file;
            updated[index].imagePreview = e.target.result;
            setTemplates(updated);
        };
        reader.readAsDataURL(file);
    };

    const handleCarouselUpload = (index, files) => {
        if (!files || files.length === 0) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const updated = [...templates];

        Array.from(files).forEach(file => {
            if (!validTypes.includes(file.type) || file.size > 5 * 1024 * 1024) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                updated[index].carousel_images.push(file);
                updated[index].carouselPreviews.push(e.target.result);
                setTemplates([...updated]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePdfUpload = (index, file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('PDF file size must be less than 10MB');
            return;
        }

        const updated = [...templates];
        updated[index].pdf_file = file;
        updated[index].pdfPreview = file.name;
        setTemplates(updated);
    };

    const removeCarouselImage = (templateIndex, imageIndex) => {
        const updated = [...templates];
        updated[templateIndex].carousel_images.splice(imageIndex, 1);
        updated[templateIndex].carouselPreviews.splice(imageIndex, 1);
        setTemplates(updated);
    };

    const addTemplate = () => {
        setTemplates([...templates, {
            template_name: '',
            content_type: CONTENT_TYPES.IMAGE,
            image: null,
            imagePreview: '',
            carousel_images: [],
            carouselPreviews: [],
            pdf_file: null,
            pdfPreview: '',
            location_link: '',
            is_dynamic: false,
            placeholders: {}
        }]);
    };

    const removeTemplate = (index) => {
        const updated = [...templates];
        updated.splice(index, 1);
        setTemplates(updated);
    };

    const isFileObject = (obj) => {
        return obj && typeof obj === 'object' && obj.constructor && obj.constructor.name === 'File';
    };

    const prepareTemplateData = async (template) => {
        const baseData = {
            template_name: template.template_name,
            content_type: template.content_type,
            is_dynamic: template.is_dynamic,
            placeholders: template.placeholders
        };

        switch (template.content_type) {
            case CONTENT_TYPES.IMAGE:
                if (template.image && isFileObject(template.image)) {
                    baseData.image = await convertToBase64(template.image);
                } else if (template.image && typeof template.image === 'string') {
                    baseData.image = template.image;
                }
                break;
            case CONTENT_TYPES.CAROUSEL:
                if (template.carousel_images.length > 0) {
                    baseData.carousel_images = await Promise.all(
                        template.carousel_images.map(img =>
                            isFileObject(img) ? convertToBase64(img) : img
                        )
                    );
                }
                break;
            case CONTENT_TYPES.PDF:
                if (template.pdf_file && isFileObject(template.pdf_file)) {
                    baseData.pdf_file = await convertToBase64(template.pdf_file);
                    baseData.pdfName = template.pdf_file.name;
                } else if (template.pdf_file && typeof template.pdf_file === 'string') {
                    baseData.pdf_file = template.pdf_file;
                    baseData.pdfName = template.pdfPreview;
                }
                break;
            case CONTENT_TYPES.LOCATION:
                baseData.location_link = template.location_link;
                break;
        }

        return baseData;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const templatesWithContent = await Promise.all(
                templates.map(template => prepareTemplateData(template))
            );

            const response = await createTemplates(templatesWithContent)

            if (response) {
                alert('Templates submitted successfully!');
                setTemplates([{
                    template_name: '',
                    content_type: CONTENT_TYPES.IMAGE,
                    image: null,
                    imagePreview: '',
                    carousel_images: [],
                    carouselPreviews: [],
                    pdf_file: null,
                    pdfPreview: '',
                    location_link: '',
                    is_dynamic: false,
                    placeholders: {}
                }]);
                fetchExistingTemplates();
            } else {
                const errorData = await response.json();
                alert(`Error submitting templates: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            alert('Error submitting templates.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditImageUpload = async (file) => {
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        try {
            setUploadingImages(prev => ({ ...prev, [editingId]: true }));
            const base64Image = await convertToBase64(file);
            setEditingTemplate(prev => ({
                ...prev,
                image: base64Image,
                imagePreview: base64Image
            }));
        } catch (error) {
            alert('Error processing image');
            console.error(error);
        } finally {
            setUploadingImages(prev => ({ ...prev, [editingId]: false }));
        }
    };

    const startEdit = (template) => {
        setEditingId(template.template_name);
        setEditingTemplate(template);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTemplate({});
    };

    const saveEdit = async (id) => {
        try {
            const templateData = await prepareTemplateData(editingTemplate);
            const response = await updateTemplate(id, templateData)

            if (response) {
                setEditingId(null);
                setEditingTemplate({});
                fetchExistingTemplates();
            } else {
                alert('Error updating template.');
            }
        } catch (error) {
            alert('Error updating template.');
            console.error(error);
        }
    };

    const deleteTemplate = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                const response = await HandleDelte(id)
                if(response.success)
                {
                 fetchExistingTemplates();
                showToast("Template has been deleted successful", "success");
                }
            } catch (error) {
                alert('Error deleting template.');
                console.error(error);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderContentUpload = (template, index) => {
        switch (template.content_type) {
            case CONTENT_TYPES.IMAGE:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {template.imagePreview ? (
                                        <img src={template.imagePreview} alt="Preview" className="w-20 h-16 object-cover rounded-md mb-2" />
                                    ) : (
                                        <Image className="w-8 h-8 mb-2 text-gray-400" />
                                    )}
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> image</p>
                                </div>
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" />
                            </label>
                        </div>
                    </div>
                );

            case CONTENT_TYPES.CAROUSEL:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Carousel Images</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Images className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> multiple images</p>
                                </div>
                                <input type="file" accept="image/*" multiple onChange={(e) => handleCarouselUpload(index, e.target.files)} className="hidden" />
                            </label>
                        </div>
                        {template.carouselPreviews.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {template.carouselPreviews.map((preview, imgIndex) => (
                                    <div key={imgIndex} className="relative">
                                        <img src={preview} alt={`Carousel ${imgIndex}`} className="w-16 h-12 object-cover rounded border" />
                                        <button
                                            onClick={() => removeCarouselImage(index, imgIndex)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case CONTENT_TYPES.PDF:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF Document</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <File className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> PDF document</p>
                                    {template.pdfPreview && <p className="text-xs text-green-600 mt-1">{template.pdfPreview}</p>}
                                </div>
                                <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(index, e.target.files[0])} className="hidden" />
                            </label>
                        </div>
                    </div>
                );

            case CONTENT_TYPES.LOCATION:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="url"
                                value={template.location_link}
                                onChange={(e) => handleChange(index, 'location_link', e.target.value)}
                                placeholder="https://maps.google.com/..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 px-10">
            <div className=" mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Template Manager</h1>
                    <p className="text-gray-600">Create and manage your templates with ease</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Existing Templates Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Existing Templates</h2>
                            <button
                                onClick={fetchExistingTemplates}
                                disabled={isLoading}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                            >
                                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : existingTemplates?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No templates found</p>
                            </div>
                        ) : (
                            <div className="space-y-4 lg:max-h-150 overflow-y-auto">
                                {existingTemplates.length > 0 && existingTemplates?.map((template) => (
                                    <div key={template.template_name} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        {editingId === template.template_name ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={editingTemplate.template_name}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Update Image</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleEditImageUpload(e.target.files[0])}
                                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700"
                                                    />
                                                    {editingTemplate.imagePreview && (
                                                        <img src={editingTemplate.imagePreview} alt="Preview" className="mt-2 w-20 h-12 object-cover border rounded" />
                                                    )}
                                                </div>
                                                <select
                                                    value={editingTemplate.is_dynamic.toString()}
                                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, is_dynamic: e.target.value === 'true' })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="false">Static</option>
                                                    <option value="true">Dynamic</option>
                                                </select>
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEdit(template.template_name)} className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">
                                                        <Save className="w-3 h-3 mr-1" />Save
                                                    </button>
                                                    <button onClick={cancelEdit} className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100">
                                                        <X className="w-3 h-3 mr-1" />Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-800 text-sm">{template.template_name}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">Type: {template.is_dynamic ? 'Dynamic' : 'Static'}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Created: {formatDate(template.created_at)}</p>
                                                    </div>
                                                    <div className="flex gap-1 ml-2">
                                                        <button onClick={() => startEdit(template)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button onClick={() => deleteTemplate(template.template_name)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {template.image && (
                                                    <img src={template.image} alt="Template preview" className="w-24 h-16 object-cover border rounded" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Templates Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Templates</h2>

                        <div className="space-y-6">
                            {templates.map((template, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">Template {index + 1}</h3>
                                        {templates.length > 1 && (
                                            <button onClick={() => removeTemplate(index)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                                                <Trash2 className="w-4 h-4 mr-1" />Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                                            <input
                                                type="text"
                                                value={template.template_name}
                                                onChange={(e) => handleChange(index, 'template_name', e.target.value)}
                                                placeholder="Enter template name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                                            <select
                                                value={template.content_type}
                                                onChange={(e) => handleChange(index, 'content_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value={CONTENT_TYPES.IMAGE}>Single Image</option>
                                                <option value={CONTENT_TYPES.CAROUSEL}>Image Carousel</option>
                                                <option value={CONTENT_TYPES.PDF}>PDF Document</option>
                                                <option value={CONTENT_TYPES.LOCATION}>Location (Google Maps)</option>
                                            </select>
                                        </div>

                                        {renderContentUpload(template, index)}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                                            <select
                                                value={template.is_dynamic.toString()}
                                                onChange={(e) => handleChange(index, 'is_dynamic', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="false">Static</option>
                                                <option value="true">Dynamic</option>
                                            </select>
                                        </div>

                                        {/* Placeholders Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">Placeholders</label>
                                                <button
                                                    onClick={() => addPlaceholder(index)}
                                                    disabled={Object.keys(template.placeholders).length >= 10}
                                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                                                >
                                                    <Plus className="w-3 h-3 inline mr-1" />Add
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {Object.entries(template.placeholders).map(([key, value]) => (
                                                    <div key={key} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={value}
                                                            onChange={(e) => handlePlaceholderChange(index, key, e.target.value)}
                                                            placeholder={`Placeholder ${parseInt(key) + 1}`}
                                                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            onClick={() => removePlaceholder(index, key)}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {Object.keys(template.placeholders).length === 0 && (
                                                <p className="text-xs text-gray-500 italic">No placeholders added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                            <button onClick={addTemplate} className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                                <Plus className="w-4 h-4 mr-2" />Add Template
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit Templates
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTemplates;