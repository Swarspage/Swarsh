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
    const [hoveredPhotoIndex, setHoveredPhotoIndex] = useState(null);

    // Theme sync
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Floating hearts for decoration
    const hearts = Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        size: 12 + Math.random() * 16,
        opacity: 0.1 + Math.random() * 0.15
    }));

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
        setUploadedPhotosPreview(newPhotos);
        setFormData({ ...formData, uploadedPhotos: newFiles });
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
            console.log('Saving onboarding data...', formData);

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
            console.log('Profile updated successfully');

            // Upload profile picture if exists
            if (formData.profilePicture) {
                const profilePicFormData = new FormData();
                profilePicFormData.append('image', formData.profilePicture);
                await api.post('/user/profile-picture', profilePicFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('Profile picture uploaded');
            }

            // Upload gallery photos
            if (formData.uploadedPhotos && formData.uploadedPhotos.length > 0) {
                console.log(`Starting to upload ${formData.uploadedPhotos.length} photos...`);
                let successCount = 0;
                let failCount = 0;

                for (let i = 0; i < formData.uploadedPhotos.length; i++) {
                    const photo = formData.uploadedPhotos[i];
                    try {
                        console.log(`Uploading photo ${i + 1}/${formData.uploadedPhotos.length}...`);
                        const photoFormData = new FormData();
                        photoFormData.append('image', photo);
                        await api.post('/user/upload-photo', photoFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        successCount++;
                        console.log(`✓ Photo ${i + 1} uploaded successfully`);
                    } catch (photoError) {
                        failCount++;
                        console.error(`✗ Photo ${i + 1} failed:`, photoError.response?.data?.error || photoError.message);
                    }
                }

                console.log(`Upload complete: ${successCount} succeeded, ${failCount} failed`);
            } else {
                console.log('No photos to upload');
            }

            console.log('Onboarding complete! Navigating to explore...');
            navigate('/explore');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            alert('Error saving your data: ' + (error.response?.data?.error || error.message));
        }
    };

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className={`min-h-screen w-full transition-all duration-500 relative overflow-hidden flex flex-col
            ${theme === 'light'
                ? 'bg-gradient-to-br from-blush via-white to-pink-100'
                : 'bg-gradient-to-br from-burgundy via-burgundy-dark to-black'}`}
        >
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl
                        ${theme === 'light' ? 'bg-pink-300/30' : 'bg-pink-600/20'}`}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl
                        ${theme === 'light' ? 'bg-pink-200/30' : 'bg-pink-600/15'}`}
                />
            </div>

            {/* Floating Hearts */}
            <AnimatePresence>
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        className="absolute pointer-events-none"
                        initial={{ y: '110vh', opacity: 0 }}
                        animate={{
                            y: '-10vh',
                            x: [0, 20, -20, 0],
                            opacity: [0, heart.opacity, heart.opacity, 0],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: heart.duration,
                            repeat: Infinity,
                            delay: heart.delay,
                            ease: "linear",
                            x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{ left: `${heart.left}vw` }}
                    >
                        <BsHeartFill
                            size={heart.size}
                            className={theme === 'light' ? 'text-pink-400' : 'text-heart-red'}
                            style={{ filter: 'blur(1px)' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-full max-w-2xl rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto
                        ${theme === 'light'
                            ? 'bg-white/80 border border-white/50 shadow-pink-200/50'
                            : 'bg-black/40 border border-white/10 shadow-black/50'}`}
                >
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-sm font-semibold ${theme === 'light' ? 'text-pink-600' : 'text-pink-400'}`}>
                                STEP {currentStep} OF {totalSteps}
                            </span>
                            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                {Math.round(progress)}% Completed
                            </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}>
                            <motion.div
                                className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
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
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Let's get to know you
                                </h2>
                                <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Start by adding a photo and your basic details.
                                </p>

                                {/* Profile Picture Upload */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative">
                                        <label htmlFor="profilePic" className="cursor-pointer block">
                                            <div className={`w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden
                                                ${theme === 'light' ? 'border-pink-300 bg-pink-50' : 'border-pink-500/50 bg-pink-900/20'}
                                                hover:border-pink-500 transition-all`}>
                                                {profilePicturePreview ? (
                                                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaCamera className="text-pink-500 text-3xl mx-auto mb-1" />
                                                        <p className={`text-xs font-medium ${theme === 'light' ? 'text-pink-600' : 'text-pink-400'}`}>
                                                            Upload Photo
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        {profilePicturePreview && (
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full shadow-lg hover:bg-pink-700 transition-colors"
                                            >
                                                <FaEdit className="text-sm" />
                                            </motion.button>
                                        )}
                                        <input
                                            type="file"
                                            id="profilePic"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Name Input */}
                                <div className="mb-6">
                                    <label className={`block mb-2 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        Your Name
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <FaHeart className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
                                        <input
                                            type="text"
                                            placeholder="e.g. Cupid"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Age Input */}
                                <div className="mb-8">
                                    <label className={`block mb-2 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        Age
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <FaHeart className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
                                        <input
                                            type="number"
                                            placeholder="e.g. 25"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => navigate('/')}
                                        className={`text-sm font-medium ${theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}
                                    >
                                        Skip
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        Next <FaArrowRight />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Preferences */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Tell us your favorites
                                </h2>
                                <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Help us find your perfect match by sharing what you love.
                                </p>

                                {/* Favorite Food */}
                                <div className="mb-6">
                                    <label className={`block mb-2 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        FAVORITE FOOD
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <FaUtensils className="text-pink-500" />
                                        <input
                                            type="text"
                                            placeholder="e.g., Italian, Sushi, Tacos..."
                                            value={formData.preferences.food}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences, food: e.target.value }
                                            })}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Favorite Song */}
                                <div className="mb-6">
                                    <label className={`block mb-2 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        FAVORITE SONG
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <FaMusic className="text-pink-500" />
                                        <input
                                            type="text"
                                            placeholder="e.g., Taylor Swift - Love Story"
                                            value={formData.preferences.song}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences, song: e.target.value }
                                            })}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Favorite Movie */}
                                <div className="mb-8">
                                    <label className={`block mb-2 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                        FAVORITE MOVIE
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                                        <FaFilm className="text-pink-500" />
                                        <input
                                            type="text"
                                            placeholder="e.g., The Notebook, Titanic..."
                                            value={formData.preferences.movie}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences, movie: e.target.value }
                                            })}
                                            className={`flex-1 bg-transparent outline-none ${theme === 'light' ? 'text-gray-800 placeholder-gray-400' : 'text-white placeholder-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBack}
                                        className={`px-8 py-3 rounded-full font-bold border-2 transition-all flex items-center gap-2
                                            ${theme === 'light' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-white/20 text-white hover:bg-white/10'}`}
                                    >
                                        <FaArrowLeft /> Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        Next <FaArrowRight />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Upload Photos */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Add your moments
                                </h2>
                                <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Show off your best self. Upload at least 3 photos to help us find your perfect match.
                                </p>

                                {/* Photo Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {uploadedPhotosPreview.map((photo, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden group"
                                            onMouseEnter={() => setHoveredPhotoIndex(index)}
                                            onMouseLeave={() => setHoveredPhotoIndex(null)}
                                        >
                                            <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    Main
                                                </div>
                                            )}
                                            {hoveredPhotoIndex === index && (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                >
                                                    <FaTimes />
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ))}

                                    {/* Add Photo Slots */}
                                    {Array.from({ length: 6 - uploadedPhotosPreview.length }).map((_, index) => (
                                        <label
                                            key={`empty-${index}`}
                                            htmlFor="photoUpload"
                                            className={`aspect-square rounded-2xl border-4 border-dashed flex items-center justify-center cursor-pointer transition-all
                                                ${theme === 'light' ? 'border-pink-200 bg-pink-50 hover:border-pink-400' : 'border-pink-500/30 bg-pink-900/10 hover:border-pink-500'}`}
                                        >
                                            <div className="text-center">
                                                <div className="text-pink-500 text-3xl mb-1">+</div>
                                                <p className={`text-xs font-medium ${theme === 'light' ? 'text-pink-600' : 'text-pink-400'}`}>
                                                    Add Photo
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <input
                                    type="file"
                                    id="photoUpload"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />

                                {/* Photo Tips */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-pink-50' : 'bg-pink-900/20'}`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <FaCamera className="text-pink-500 mt-1" />
                                        <span className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                            Photo Tips
                                        </span>
                                    </div>
                                    <ul className={`text-sm space-y-1 ml-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                        <li className="flex items-center gap-2">
                                            <FaCheck className="text-green-500 text-xs" /> Smile and look at the camera
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FaCheck className="text-green-500 text-xs" /> Include a full body shot
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FaTimes className="text-red-500 text-xs" /> Avoid group photos as your main pic
                                        </li>
                                    </ul>
                                </motion.div>

                                {/* Photo Counter */}
                                <div className={`text-center mb-6 ${theme === 'light' ? 'text-pink-600' : 'text-pink-400'} font-semibold`}>
                                    <FaCamera className="inline mr-2" />
                                    {uploadedPhotosPreview.length}/3 photos uploaded
                                    {uploadedPhotosPreview.length >= 3 && " ✓"}
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBack}
                                        className={`px-8 py-3 rounded-full font-bold border-2 transition-all
                                            ${theme === 'light' ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-white/20 text-white hover:bg-white/10'}`}
                                    >
                                        Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: uploadedPhotosPreview.length >= 3 ? 1.05 : 1 }}
                                        whileTap={{ scale: uploadedPhotosPreview.length >= 3 ? 0.95 : 1 }}
                                        onClick={handleNext}
                                        disabled={uploadedPhotosPreview.length < 3}
                                        className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all
                                            ${uploadedPhotosPreview.length >= 3
                                                ? 'bg-gradient-to-r from-pink to-pink-2 text-white hover:shadow-xl cursor-pointer'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        Next
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Preview & Complete */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.4 }}
                                className="text-center"
                            >
                                <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Looking great! 💕
                                </h2>
                                <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    One last look before you find your match.
                                </p>

                                {/* Profile Preview */}
                                <div className="mb-8">
                                    {/* Profile Picture */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500 shadow-xl">
                                                {profilePicturePreview ? (
                                                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-pink-100' : 'bg-pink-900/30'}`}>
                                                        <FaHeart className="text-pink-500 text-4xl" />
                                                    </div>
                                                )}
                                            </div>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -bottom-2 -right-2 bg-pink-600 text-white p-2 rounded-full shadow-lg"
                                            >
                                                <FaCheck />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Name & Age */}
                                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                        {formData.name || 'Your Name'}, {formData.age || '00'}
                                    </h3>
                                    <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} italic`}>
                                        Lover of {formData.preferences.food || 'good food'}, {formData.preferences.song || 'great music'},
                                        and {formData.preferences.movie || 'awesome movies'}. Always looking for the next best adventure! 🌟
                                    </p>

                                    {/* Interest Tags */}
                                    <div className="flex flex-wrap gap-2 justify-center mb-8">
                                        {formData.preferences.food && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                                                    ${theme === 'light' ? 'bg-pink-100 text-pink-700' : 'bg-pink-900/40 text-pink-300'}`}
                                            >
                                                <FaUtensils /> Foodie
                                            </motion.span>
                                        )}
                                        {formData.preferences.song && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                                                    ${theme === 'light' ? 'bg-pink-100 text-pink-700' : 'bg-pink-900/40 text-pink-300'}`}
                                            >
                                                <FaMusic /> Music
                                            </motion.span>
                                        )}
                                        {formData.preferences.movie && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                                                    ${theme === 'light' ? 'bg-pink-100 text-pink-700' : 'bg-pink-900/40 text-pink-300'}`}
                                            >
                                                <FaFilm /> Movies
                                            </motion.span>
                                        )}
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                                                ${theme === 'light' ? 'bg-pink-100 text-pink-700' : 'bg-pink-900/40 text-pink-300'}`}
                                        >
                                            <FaCamera /> Photography
                                        </motion.span>
                                    </div>

                                    {/* Photos Preview Label */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} uppercase`}>
                                            Your Photos
                                        </span>
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="text-pink-600 text-sm font-medium hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    {/* Photos Grid */}
                                    <div className="grid grid-cols-4 gap-3 mb-6">
                                        {uploadedPhotosPreview.map((photo, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ scale: 0, rotate: -10 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="aspect-square rounded-xl overflow-hidden shadow-md"
                                            >
                                                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Complete Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleComplete}
                                    className="w-full bg-gradient-to-r from-pink to-pink-2 text-white py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all mb-4"
                                >
                                    Complete Setup 🎉
                                </motion.button>

                                <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    By completing setup, you agree to our{' '}
                                    <span className="text-pink-600 hover:underline cursor-pointer">Terms</span>
                                    {' '}and{' '}
                                    <span className="text-pink-600 hover:underline cursor-pointer">Privacy Policy</span>.
                                </p>

                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className={`mt-6 text-sm ${theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Back to previous step
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
