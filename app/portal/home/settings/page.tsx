"use client"
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';




export default function SettingsPage() {
    const handleHomeClick = () => {
    document.documentElement.classList.remove('dark');
    router.push('/');
    };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    minor: '',
    graduation: '',
    gpa: '',
    headshot: '',
    LinkedIn: '',
    bio: '',
    resume: '',
    resumeLastUpdated: null as string | null,
    // Non-editable fields
    type: '',
    exec: false,
    pc: '2026',
    });

  useEffect(() => {
    // Check dark mode
    const darkMode = document.documentElement.classList.contains('dark');
    setIsDark(darkMode);

    // Fetch user data
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          major: user.major,
          minor: user.minor,
          graduation: user.graduation,
          gpa: user.gpa,
          LinkedIn: user.LinkedIn,
          bio: user.bio,
          pc: user.pc,
          resume: user.resume,
          resumeLastUpdated: user.resumeLastUpdated,
        }),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleHeadshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setOriginalFile(file);
      setShowCropModal(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate dimensions
    const imgWidth = image.naturalWidth * scale;
    const imgHeight = image.naturalHeight * scale;
    const x = (size - imgWidth) / 2 + position.x;
    const y = (size - imgHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, x, y, imgWidth, imgHeight);

    // Restore context
    ctx.restore();

    // Draw circle border
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  useEffect(() => {
    if (showCropModal && imageRef.current) {
      drawCanvas();
    }
  }, [scale, position, showCropModal, isDark]);

  const handleCropSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalFile) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });

      const croppedFile = new File([blob], originalFile.name, {
        type: 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('headshot', croppedFile);

      const response = await fetch('/api/user/headshot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload headshot');

      const data = await response.json();
      setUser(prev => ({ ...prev, headshot: data.url }));
      toast.success('Headshot updated successfully!');
      
      // Close modal and reset
      setShowCropModal(false);
      setImageSrc(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } catch (error) {
      console.error('Error uploading headshot:', error);
      toast.error('Failed to upload headshot');
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

   const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      toast.error('Please upload a valid file format (.pdf, .doc, .docx, .jpg, .png)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/user/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload resume');

      const data = await response.json();
      toast.success('Resume updated successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    }
  };

   const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never uploaded';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Crop Your Headshot
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              {/* Hidden image for loading */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source"
                style={{ display: 'none' }}
                onLoad={drawCanvas}
              />
              
              {/* Canvas preview */}
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-full"
                style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
              />

              {/* Zoom control */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min={.3}
                  max={.4}
                  step={0.01}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Position controls */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horizontal
                  </label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={position.x}
                    onChange={(e) => setPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vertical
                  </label>
                  <input
                    type="range"
                    min={-70}
                    max={70}
                    value={position.y}
                    onChange={(e) => setPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCropSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCropCancel}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {/* Back Button */}
      <button
        onClick={() => router.push('/portal/home')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Manage your account settings and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <Image
                src={user.headshot || '/placeholder-headshot.jpg'}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-blue-200 dark:border-blue-700"
              />
              <div>
                <label
                  htmlFor="headshot"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Upload New Photo
                </label>
                <input
                  id="headshot"
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                  placeholder="example@email.sc.edu"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="LinkedIn"
                  name="LinkedIn"
                  value={user.LinkedIn}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <input
                  type="text"
                  id="bio"
                  name="bio"
                  value={user.bio}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
             </div>


              <div>
                <label htmlFor="graduation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Graduation Year
                </label>
                <select
                  id="graduation"
                  name="graduation"
                  value={user.graduation}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border appearance-none border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select Graduation Year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
            </div>
          </div>
        

          {/* Academic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Major(s)
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  value={user.major}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Computer Science, IT, etc."
                />
              </div>

              <div>
                <label htmlFor="minor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minor(s)
                </label>
                <input
                  type="text"
                  id="minor"
                  name="minor"
                  value={user.minor}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPA
                </label>
                <input
                  type="text"
                  id="gpa"
                  name="gpa"
                  value={user.gpa}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="3.5"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resume/CV</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a new resume to update your application materials
              </p>
              <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    Last updated: <span className="font-medium text-gray-900 dark:text-white">{formatDate(user.resumeLastUpdated)}</span>
                  </span>
                </div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="resume"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload New Resume
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  PDF, DOC, JPG, PNG (max 5MB)
                </span>
              </div>
            </div>
          </div>

          {/* Account Information (Non-Editable) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Account Type:</span>
                <span className="text-gray-900 dark:text-white font-semibold capitalize">{user.type}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Executive Member:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.exec ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {user.exec ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">PC Member:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.pc ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {user.pc}
                </span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
            <button
              type="button"
              onClick={() => router.push('/login/forgotpassword')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}