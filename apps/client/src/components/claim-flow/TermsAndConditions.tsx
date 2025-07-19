"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, CreateBusinessDto } from "@/lib/api";

const TermsAndConditions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('swipeSavvyUser');
    console.log('🔍 Debug - Stored user data:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('🔍 Debug - Parsed user data:', parsedUser);
      setUserData(parsedUser);
    } else {
      console.log('❌ Debug - No user data found in localStorage');
    }

    // Get business data from URL params or localStorage
    const businessDataParam = searchParams.get('businessData');
    console.log('🔍 Debug - Business data from URL:', businessDataParam);
    
    if (businessDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(businessDataParam));
        console.log('🔍 Debug - Parsed business data from URL:', parsed);
        setBusinessData(parsed);
        localStorage.setItem('swipeSavvyBusinessData', JSON.stringify(parsed));
      } catch (error) {
        console.error('❌ Error parsing business data from URL:', error);
      }
    } else {
      const storedBusiness = localStorage.getItem('swipeSavvyBusinessData');
      console.log('🔍 Debug - Stored business data:', storedBusiness);
      if (storedBusiness) {
        const parsedBusiness = JSON.parse(storedBusiness);
        console.log('🔍 Debug - Parsed stored business data:', parsedBusiness);
        setBusinessData(parsedBusiness);
      } else {
        console.log('❌ Debug - No business data found in localStorage or URL');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAgreed) {
      alert('Please read and agree to the terms and conditions to continue.');
      return;
    }

    console.log('🔍 Debug - Checking data before submit:');
    console.log('👤 User data:', userData);
    console.log('🏢 Business data:', businessData);

    if (!userData || !businessData) {
      console.log('❌ Debug - Missing data:');
      console.log('❌ User data missing?', !userData);
      console.log('❌ Business data missing?', !businessData);
      setApiError('Missing user or business data. Please go back and complete the previous steps.');
      return;
    }

    setIsLoading(true);
    setApiError('');
    
    try {
      // Create business data for API
      const createBusinessData: CreateBusinessDto = {
        googlePlaceId: businessData.placeId,
        name: businessData.name,
        address: businessData.address,
        phone: businessData.phoneNumber || 'Not provided',
      };

      console.log('🚀 Debug - Calling API to create business:', createBusinessData);
      console.log('🚀 Debug - For user ID:', userData.id);

      // Call API to create business for the user
      const business = await apiClient.createBusiness(userData.id, createBusinessData);
      
      console.log('✅ Business created successfully:', business);
      
      // Store complete data for success page
      localStorage.setItem('swipeSavvyBusiness', JSON.stringify(business));
      
      // Navigate to success page
      router.push('/claim-listing/success');
    } catch (error: any) {
      console.error('❌ Error creating business:', error);
      
      if (error.message.includes('already has a business')) {
        setApiError('This user already has a business registered. Please contact support if this is an error.');
      } else if (error.message.includes('not found')) {
        setApiError('User not found. Please go back and create your account again.');
      } else {
        setApiError('Failed to register your business. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const termsData = [
    {
      id: 'merchant-agreement',
      title: 'Swipe Savvy Merchant Agreement',
      content: `
        **1. MERCHANT SERVICES**
        By joining Swipe Savvy, you gain access to our comprehensive loyalty platform including customer rewards management, digital marketing tools, and analytics dashboard.

        **2. LISTING REQUIREMENTS**
        Your business listing must contain accurate information including business name, address, phone number, and operating hours. You agree to update this information promptly when changes occur.

        **3. REWARD PROGRAM**
        You have full control over your reward structure and can modify point values, redemption rates, and special offers at any time through your merchant dashboard.

        **4. PAYMENT PROCESSING**
        All customer transactions are processed securely through our PCI-compliant payment system. You will receive settlements according to your chosen schedule.

        **5. MARKETING MATERIALS**
        Swipe Savvy will provide window stickers, POS signage, and digital marketing materials at no cost. Additional materials can be ordered through your merchant portal.

        **6. DATA OWNERSHIP**
        You retain full ownership of your customer data. Swipe Savvy acts as a processor and will never share or sell your customer information to third parties.

        **7. TERMINATION**
        Either party may terminate this agreement with 30 days written notice. Upon termination, you retain access to all customer data for download.
      `
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      content: `
        **INFORMATION WE COLLECT**
        We collect business information you provide during registration, transaction data from your payment processing, and customer interaction data from your loyalty program.

        **HOW WE USE INFORMATION**
        Your information is used to provide merchant services, process payments, generate analytics reports, and improve our platform functionality.

        **DATA SECURITY**
        We employ industry-standard encryption, secure data centers, and regular security audits to protect your information and your customers' data.

        **SHARING AND DISCLOSURE**
        We do not sell or rent your data to third parties. Information may only be shared with service providers necessary for platform operation or as required by law.

        **YOUR RIGHTS**
        You have the right to access, modify, or delete your account data at any time. You can export customer data and transaction history from your dashboard.

        **COOKIES AND TRACKING**
        Our platform uses cookies to improve user experience and provide analytics. You can control cookie preferences in your account settings.

        **POLICY UPDATES**
        We will notify you of any material changes to this privacy policy via email and dashboard notifications 30 days before changes take effect.
      `
    },
    {
      id: 'service-terms',
      title: 'Service Terms',
      content: `
        **PLATFORM AVAILABILITY**
        We strive for 99.9% uptime and provide 24/7 technical support. Scheduled maintenance will be announced 48 hours in advance.

        **FREE TIER BENEFITS**
        Your free listing includes: unlimited customer profiles, basic loyalty program, monthly analytics reports, and standard customer support.

        **UPGRADE OPTIONS**
        Premium features include advanced analytics, custom branding, priority support, and additional marketing tools. Pricing is available in your merchant dashboard.

        **COMPLIANCE**
        Merchants must comply with all applicable laws, regulations, and card network rules. Swipe Savvy provides compliance guidance and updates.

        **INTELLECTUAL PROPERTY**
        You grant Swipe Savvy a license to use your business name and logo for platform operation and marketing materials related to our services.

        **LIMITATION OF LIABILITY**
        Swipe Savvy's liability is limited to the fees paid for services. We are not liable for business interruption, lost profits, or consequential damages.

        **DISPUTE RESOLUTION**
        Any disputes will be resolved through binding arbitration in accordance with commercial arbitration rules.
      `
    }
  ];

  const benefits = [
    {
      icon: '🏪',
      title: 'Free Business Listing',
      description: 'Professional listing with photos, hours, and contact info'
    },
    {
      icon: '🏷️',
      title: 'Window Sticker',
      description: 'Professional Swipe Savvy decal for your storefront'
    },
    {
      icon: '📋',
      title: 'POS Signage',
      description: 'Counter displays and promotional materials'
    },
    {
      icon: '💳',
      title: 'Reward-Enabled Checkout',
      description: 'Complete loyalty and payment processing system'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track customer behavior and loyalty metrics'
    },
    {
      icon: '🎯',
      title: 'Marketing Tools',
      description: 'Email campaigns and promotional features'
    }
  ];

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
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Step 3 of 4
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
                width: '75%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '40px',
            alignItems: 'flex-start'
          }}
        >
          
          {/* Terms Content */}
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
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: '900',
                  color: '#111827',
                  marginBottom: '16px',
                  lineHeight: '1.2'
                }}
              >
                📜 Just One More Step
              </h1>
              <p 
                style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}
              >
                Please review and agree to our terms before activating your account.
              </p>
            </div>



            {/* API Error Display */}
            {apiError && (
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
                  {apiError}
                </p>
              </div>
            )}

            {/* Terms Accordion */}
            <div style={{ marginBottom: '40px' }}>
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '20px'
                }}
              >
                Terms & Conditions Preview
              </h3>
              
              {termsData.map((section) => (
                <div 
                  key={section.id}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: expandedSection === section.id ? '#f3f4f6' : 'white',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      if (expandedSection !== section.id) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (expandedSection !== section.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <span>{section.title}</span>
                    <span 
                      style={{
                        fontSize: '18px',
                        color: '#10b981',
                        transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      ⌄
                    </span>
                  </button>
                  
                  {expandedSection === section.id && (
                    <div 
                      style={{
                        padding: '20px',
                        background: '#f9fafb',
                        borderTop: '1px solid #e5e7eb'
                      }}
                    >
                      <div 
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#4b5563',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {section.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Agreement Form */}
            <form onSubmit={handleSubmit}>
              
              {/* Agreement Checkbox */}
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
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#10b981',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  />
                  <span>
                    I have read and agree to the <strong>Swipe Savvy Merchant Agreement</strong> and <strong>Privacy Policy</strong>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <button
                  type="submit"
                  disabled={!hasAgreed || isLoading}
                  style={{
                    background: hasAgreed && !isLoading 
                      ? 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' 
                      : '#9ca3af',
                    color: 'white',
                    padding: '16px 48px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: hasAgreed && !isLoading ? 'pointer' : 'not-allowed',
                    boxShadow: hasAgreed && !isLoading 
                      ? '0 10px 25px -5px rgba(16, 185, 129, 0.3)' 
                      : 'none',
                    transition: 'all 0.2s ease',
                    minWidth: '250px'
                  }}
                  onMouseOver={(e) => {
                    if (hasAgreed && !isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (hasAgreed && !isLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                    }
                  }}
                >
                  {isLoading ? '⏳ Activating...' : '🚀 Activate My Free Listing'}
                </button>
              </div>

              {/* Subtext */}
              <div style={{ textAlign: 'center' }}>
                <p 
                  style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  📦 We'll ship your Swipe Savvy window sticker and POS signage within 5–7 business days.
                </p>
              </div>

            </form>
          </div>

          {/* Benefits Sidebar */}
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
              position: 'sticky',
              top: '40px'
            }}
          >
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#111827',
                  marginBottom: '8px'
                }}
              >
                🎉 Your Free Benefits
              </h3>
              <p 
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}
              >
                Everything included at no cost
              </p>
            </div>

                         <div>
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '24px',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      flexShrink: 0
                    }}
                  >
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 4px 0'
                      }}
                    >
                      {benefit.title}
                    </h4>
                    <p 
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0,
                        lineHeight: '1.4'
                      }}
                    >
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Value Highlight */}
            <div 
              style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '16px',
                textAlign: 'center',
                color: 'white'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
              <h4 
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  margin: '0 0 4px 0'
                }}
              >
                Total Value: $500+
              </h4>
              <p 
                style={{
                  fontSize: '14px',
                  margin: 0,
                  opacity: 0.9
                }}
              >
                All yours completely free
              </p>
            </div>

          </div>
        </div>

        {/* Mobile Responsive Layout */}
        <style jsx>{`
          @media (max-width: 768px) {
            .terms-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .benefits-sidebar {
              position: static !important;
              order: -1;
            }
          }
        `}</style>

      </div>
    </div>
  );
};

export default TermsAndConditions;
