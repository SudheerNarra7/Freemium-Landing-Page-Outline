"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, CreateUserDto } from "@/lib/api";

interface FormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  smsOptIn: boolean;
  password: string;
  confirmPassword: string;
  websiteOrSocial: string;
  businessOwnerConfirmation: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
  confirmPassword?: string;
  businessOwnerConfirmation?: string;
  api?: string;
}

const AccountCreate = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    mobileNumber: '',
    smsOptIn: false,
    password: '',
    confirmPassword: '',
    websiteOrSocial: '',
    businessOwnerConfirmation: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!phoneRegex.test(formData.mobileNumber.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Business owner confirmation
    if (!formData.businessOwnerConfirmation) {
      newErrors.businessOwnerConfirmation = 'You must confirm you are authorized to claim this business';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing (only for fields that can have errors)
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous API errors
    
    try {
      // Create user data for API
      const userData: CreateUserDto = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        hasAcceptedTerms: formData.businessOwnerConfirmation,
      };

      // Call API to create user
      const user = await apiClient.createUser(userData);
      
      console.log('User created successfully:', user);
      
      // Store user data in localStorage for the next step
      localStorage.setItem('swipeSavvyUser', JSON.stringify({
        ...user,
        mobileNumber: formData.mobileNumber,
        smsOptIn: formData.smsOptIn,
        websiteOrSocial: formData.websiteOrSocial,
      }));
      
      // Get business data from localStorage and pass it to terms page
      const storedBusinessData = localStorage.getItem('swipeSavvyBusinessData');
      if (storedBusinessData) {
        const businessData = JSON.parse(storedBusinessData);
        const businessDataParam = encodeURIComponent(JSON.stringify(businessData));
        router.push(`/claim-listing/terms?businessData=${businessDataParam}`);
      } else {
        // Navigate without business data if not found
        router.push('/claim-listing/terms');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      } else {
        setErrors({ api: 'Failed to create account. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '40px 20px'
      }}
    >
      <div 
        style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Step 2 of 4
            </span>
          </div>
          <div 
            style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div 
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6'
          }}
        >
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: '900',
                color: '#111827',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}
            >
              Create Your Swipe Savvy Account
            </h1>
            <p 
              style={{
                fontSize: '18px',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
                                      Set up your account to manage your business listing and start building customer loyalty.
                      </p>
                    </div>

                    {/* API Error Display */}
                    {errors.api && (
                      <div 
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '24px',
                          textAlign: 'center'
                        }}
                      >
                        <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>
                          {errors.api}
                        </p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
            {/* Form Grid - Two columns on desktop, single on mobile */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}
            >
              
              {/* Full Name */}
              <div>
                <label 
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: `2px solid ${errors.fullName ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                  onFocus={(e) => {
                    if (!errors.fullName) e.target.style.borderColor = '#10b981';
                  }}
                  onBlur={(e) => {
                    if (!errors.fullName) e.target.style.borderColor = '#e5e7eb';
                  }}
                />
                {errors.fullName && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label 
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: `2px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#10b981';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#e5e7eb';
                  }}
                />
                {errors.email && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label 
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      fontSize: '16px',
                      border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                    onFocus={(e) => {
                      if (!errors.password) e.target.style.borderColor = '#10b981';
                    }}
                    onBlur={(e) => {
                      if (!errors.password) e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label 
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '12px 48px 12px 16px',
                      fontSize: '16px',
                      border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                    onFocus={(e) => {
                      if (!errors.confirmPassword) e.target.style.borderColor = '#10b981';
                    }}
                    onBlur={(e) => {
                      if (!errors.confirmPassword) e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280'
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Number with SMS Opt-in */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Mobile Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: `2px solid ${errors.mobileNumber ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: '12px'
                }}
                onFocus={(e) => {
                  if (!errors.mobileNumber) e.target.style.borderColor = '#10b981';
                }}
                onBlur={(e) => {
                  if (!errors.mobileNumber) e.target.style.borderColor = '#e5e7eb';
                }}
              />
              
              {/* SMS Opt-in Checkbox */}
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6b7280'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.smsOptIn}
                  onChange={(e) => handleInputChange('smsOptIn', e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#10b981'
                  }}
                />
                I agree to receive SMS notifications and updates about my business listing
              </label>
              
              {errors.mobileNumber && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
                  {errors.mobileNumber}
                </p>
              )}
            </div>

            {/* Website or Social Link (Optional) */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Website or Social Link <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>(Optional)</span>
              </label>
              <input
                type="url"
                value={formData.websiteOrSocial}
                onChange={(e) => handleInputChange('websiteOrSocial', e.target.value)}
                placeholder="https://yourwebsite.com or https://instagram.com/yourbusiness"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>

            {/* Business Owner Confirmation */}
            <div style={{ marginBottom: '32px' }}>
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#374151',
                  lineHeight: '1.5'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.businessOwnerConfirmation}
                  onChange={(e) => handleInputChange('businessOwnerConfirmation', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#10b981',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
                <span>
                  I am the owner or authorized representative of this business and have the right to claim this listing.
                  <span style={{ color: '#ef4444' }}> *</span>
                </span>
              </label>
              {errors.businessOwnerConfirmation && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', marginLeft: '30px' }}>
                  {errors.businessOwnerConfirmation}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  color: 'white',
                  padding: '16px 48px',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.7 : 1,
                  minWidth: '200px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                {isLoading ? '⏳ Creating Account...' : '➡️ Continue'}
              </button>
            </div>

            {/* Helper Text */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
                <br />
                Your information will be kept secure and never shared with third parties.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountCreate;
