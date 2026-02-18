/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaArrowRight, FaArrowLeft, FaCamera, FaEdit, FaMusic, FaFilm, FaUtensils, FaTimes, FaCheck } from 'react-icons/fa';
import { BsHeartFill } from 'react-icons/bs';
import api from '../api/axios';

const Onboarding = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        profilePicture: null,
        preferences: {
            food: '',
            song: '',
            movie: ''
        },
        uploadedPhotos: []
    });

    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [uploadedPhotosPreview, setUploadedPhotosPreview] = useState([]);

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profilePicture: file });
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.slice(0, 6 - uploadedPhotosPreview.length);

        const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
        setUploadedPhotosPreview([...uploadedPhotosPreview, ...newPreviews]);
        setFormData({
            ...formData,
            uploadedPhotos: [...formData.uploadedPhotos, ...newPhotos]
        });
    };

    const removePhoto = (index) => {
        const newPhotos = uploadedPhotosPreview.filter((_, i) => i !== index);
        const newFiles = formData.uploadedPhotos.filter((_, i) => i !== index);
        const newCaptions = (formData.captions || []).filter((_, i) => i !== index);

        setUploadedPhotosPreview(newPhotos);
        setFormData({
            ...formData,
            uploadedPhotos: newFiles,
            captions: newCaptions
        });
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            // Update profile with basic info and preferences
            await api.put('/user/profile', {
                name: formData.name,
                age: parseInt(formData.age),
                preferences: {
                    food: formData.preferences.food,
                    song: formData.preferences.song,
                    movie: formData.preferences.movie
                },
                bio: `Looking for someone special! 💕`
            });

            // Upload profile picture if exists
            if (formData.profilePicture) {
                const profilePicFormData = new FormData();
                profilePicFormData.append('image', formData.profilePicture);
                await api.post('/user/profile-picture', profilePicFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Upload gallery photos
            if (formData.uploadedPhotos && formData.uploadedPhotos.length > 0) {
                for (let i = 0; i < formData.uploadedPhotos.length; i++) {
                    const photo = formData.uploadedPhotos[i];
                    try {
                        const photoFormData = new FormData();
                        photoFormData.append('image', photo);
                        const caption = formData.captions?.[i] || '';
                        if (caption) {
                            photoFormData.append('caption', caption);
                        }
                        photoFormData.append('contextTags', JSON.stringify(['Onboarding']));

                        await api.post('/user/upload-photo', photoFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (photoError) {
                        console.error(`✗ Photo ${i + 1} failed:`, photoError);
                    }
                }
            }
            navigate('/explore');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            alert('Error saving your data: ' + (error.response?.data?.error || error.message));
        }
    };

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    // Theme Constants
    const isLight = theme === 'light';
    const pageBg = isLight
        ? 'bg-gradient-to-b from-[#FFFFFF] to-[#A8A7ED]'
        : 'bg-gradient-to-b from-[#09090F] to-[#12101F]';

    const textPrimary = isLight ? 'text-[#000407]' : 'text-[#F0EFFF]';
    const textSecondary = isLight ? 'text-[#000407] opacity-60' : 'text-[#F0EFFF] opacity-50';
    const accentColor = '#A8A7ED';

    const glassStyle = {
        background: isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(168, 167, 237, 0.05)',
        backdropFilter: 'blur(16px)',
        border: isLight ? '1px solid rgba(168, 167, 237, 0.2)' : '1px solid rgba(168, 167, 237, 0.1)',
        boxShadow: isLight ? '0 4px 30px rgba(0, 0, 0, 0.1)' : '0 4px 30px rgba(0, 0, 0, 0.3)',
    };

    const inputClass = `w-full px-4 py-3 rounded-[14px] outline-none transition-all duration-300 text-sm font-medium
    ${isLight
            ? 'bg-white/50 border border-[#A8A7ED]/20 text-[#000407] focus:border-[#A8A7ED] focus:ring-1 focus:ring-[#A8A7ED]'
            : 'bg-white/5 border border-[#A8A7ED]/10 text-white placeholder-white/30 focus:border-[#A8A7ED]/50 focus:ring-1 focus:ring-[#A8A7ED]/50'}`;


    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col font-sans ${pageBg}`}>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-xl rounded-[32px] p-8 md:p-12"
                    style={glassStyle}
                >
                    {/* Progress Indicator */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold tracking-widest uppercase text-[#A8A7ED]`}>
                                Step {currentStep} of {totalSteps}
                            </span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-[#A8A7ED]/20' : 'bg-white/10'}`}>
                            <motion.div
                                className="h-full bg-[#A8A7ED]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Basic Info & Profile Picture */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                                    Let's get to know you
                                </h2>
                                <p className={`mb-8 text-sm ${textSecondary}`}>
                                    Start by adding a photo and your basic details.
                                </p>

                                {/* Profile Picture Upload */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative">
                                        <label htmlFor="profilePic" className="cursor-pointer block">
                                            <div className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all
                                                ${isLight ? 'border-[#A8A7ED]/50 bg-[#A8A7ED]/5 hover:border-[#A8A7ED]' : 'border-[#A8A7ED]/30 bg-white/5 hover:border-[#A8A7ED]/60'}`}>
                                                {profilePicturePreview ? (
                                                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaCamera className="text-[#A8A7ED] text-2xl mx-auto mb-2 opacity-70" />
                                                        <p className={`text-[10px] font-bold uppercase tracking-wide text-[#A8A7ED]`}>
                                                            Upload
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        <input
                                            type="file"
                                            id="profilePic"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>Age</label>
                                        <input
                                            type="number"
                                            placeholder="Your age"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => navigate('/')}
                                        className={`text-xs font-bold uppercase tracking-wide hover:opacity-100 opacity-60 transition-opacity ${textPrimary}`}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-[#A8A7ED] text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-[#A8A7ED]/30 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        Next <FaArrowRight size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Preferences */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                                    Your favorites
                                </h2>
                                <p className={`mb-8 text-sm ${textSecondary}`}>
                                    Help us find your match by sharing what you love.
                                </p>

                                <div className="space-y-5 mb-8">
                                    <div>
                                        <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>Favorite Food</label>
                                        <div className="relative">
                                            <FaUtensils className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A7ED] opacity-70" size={12} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Sushi, Tacos..."
                                                value={formData.preferences.food}
                                                onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, food: e.target.value } })}
                                                className={`${inputClass} pl-10`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>Favorite Song</label>
                                        <div className="relative">
                                            <FaMusic className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A7ED] opacity-70" size={12} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Love Story..."
                                                value={formData.preferences.song}
                                                onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, song: e.target.value } })}
                                                className={`${inputClass} pl-10`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>Favorite Movie</label>
                                        <div className="relative">
                                            <FaFilm className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A7ED] opacity-70" size={12} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Inception..."
                                                value={formData.preferences.movie}
                                                onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, movie: e.target.value } })}
                                                className={`${inputClass} pl-10`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <button
                                        onClick={handleBack}
                                        className={`px-6 py-3 rounded-full text-sm font-bold border transition-all flex items-center gap-2
                                            ${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                                    >
                                        <FaArrowLeft size={10} /> Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-[#A8A7ED] text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-[#A8A7ED]/30 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        Next <FaArrowRight size={10} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Upload Photos */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                                    Your Gallery
                                </h2>
                                <p className={`mb-6 text-sm ${textSecondary}`}>
                                    Upload at least 3 photos.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                    {uploadedPhotosPreview.map((photo, index) => (
                                        <div key={index} className="relative aspect-square rounded-[14px] overflow-hidden group">
                                            <img src={photo} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Photo Slot */}
                                    {Array.from({ length: Math.min(6 - uploadedPhotosPreview.length, 1) }).map((_, index) => (
                                        <label
                                            key={`empty-${index}`}
                                            className={`aspect-square rounded-[14px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-1
                                                ${isLight ? 'border-[#A8A7ED]/30 hover:bg-[#A8A7ED]/5' : 'border-[#A8A7ED]/20 hover:bg-white/5'}`}
                                        >
                                            <FaCamera className="text-[#A8A7ED] opacity-60" />
                                            <span className="text-[10px] font-bold text-[#A8A7ED] uppercase tracking-wide">Add</span>
                                            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    ))}
                                </div>

                                <div className="mb-8">
                                    {uploadedPhotosPreview.map((_, index) => (
                                        <div key={index} className="mb-2">
                                            <input
                                                type="text"
                                                placeholder={`Caption for photo ${index + 1}...`}
                                                value={formData.captions?.[index] || ''}
                                                onChange={(e) => {
                                                    const newCaptions = [...(formData.captions || [])];
                                                    newCaptions[index] = e.target.value;
                                                    setFormData({ ...formData, captions: newCaptions });
                                                }}
                                                className={`${inputClass} py-2 text-xs`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between gap-4">
                                    <button
                                        onClick={handleBack}
                                        className={`px-6 py-3 rounded-full text-sm font-bold border transition-all
                                            ${isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/10 text-white/70 hover:bg-white/5'}`}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={uploadedPhotosPreview.length < 3}
                                        className={`px-8 py-3 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95
                                            ${uploadedPhotosPreview.length >= 3
                                                ? 'bg-[#A8A7ED] text-white hover:shadow-[#A8A7ED]/30'
                                                : 'bg-gray-300 dark:bg-white/10 text-gray-400 dark:text-white/20 cursor-not-allowed'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Review */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 mx-auto bg-[#A8A7ED]/20 rounded-full flex items-center justify-center mb-6">
                                    <FaCheck className="text-[#A8A7ED] text-4xl" />
                                </div>

                                <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                                    All Set!
                                </h2>
                                <p className={`mb-8 text-sm ${textSecondary}`}>
                                    You're ready to find your soulmate.
                                </p>

                                <div className={`p-4 rounded-[20px] mb-8 text-left border ${isLight ? 'bg-white/40 border-[#A8A7ED]/20' : 'bg-white/5 border-[#A8A7ED]/10'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            {profilePicturePreview ? (
                                                <img src={profilePicturePreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-[#A8A7ED]" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${textPrimary}`}>{formData.name}, {formData.age}</h3>
                                            <p className={`text-xs ${textSecondary}`}>Ready to explore</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[formData.preferences.food, formData.preferences.song, formData.preferences.movie].filter(Boolean).map((tag, i) => (
                                            <span key={i} className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide
                                                ${isLight ? 'bg-[#A8A7ED]/10 text-[#A8A7ED]' : 'bg-[#A8A7ED]/20 text-[#A8A7ED]'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleComplete}
                                    className="w-full bg-[#A8A7ED] text-white py-3.5 rounded-full font-bold text-sm shadow-xl hover:shadow-[#A8A7ED]/40 transition-all active:scale-95"
                                >
                                    Complete Setup
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Onboarding;
