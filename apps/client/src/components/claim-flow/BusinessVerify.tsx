"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BusinessDetails {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  photoUrl?: string;
  rating?: number;
  website?: string;
}

interface BusinessVerifyProps {
  businessData?: BusinessDetails;
  onTryAgain?: () => void;
  onConfirm?: (business: BusinessDetails) => void;
}

const BusinessVerify = ({ 
  businessData = {
    placeId: "sample-id",
    name: "Sample Coffee Shop",
    address: "123 Main Street, New York, NY 10001",
    phoneNumber: "+1 (555) 123-4567",
    photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    website: "https://samplecoffee.com"
  },
  onTryAgain,
  onConfirm
}: BusinessVerifyProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Store business data in localStorage for next steps
      localStorage.setItem('swipeSavvyBusinessData', JSON.stringify(businessData));
      
      if (onConfirm) {
        onConfirm(businessData);
      } else {
        // Navigate to next step
        router.push('/claim-listing/account-create');
      }
    } catch (error) {
      console.error('Error confirming business:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      // Navigate back to step 1
      router.push('/');
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
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Step 1 of 4
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
                width: '25%',
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
              Is This Your Business?
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
              We found the following match for your entry. Please confirm before proceeding.
            </p>
          </div>

          {/* Business Details Card */}
          <div 
            style={{
              background: '#f9fafb',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '40px',
              border: '1px solid #e5e7eb'
            }}
          >
            <div 
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}
            >
              
              {/* Business Image */}
              {businessData.photoUrl && (
                <div 
                  style={{
                    flex: '0 0 200px',
                    minWidth: '200px'
                  }}
                >
                  <img 
                    src={businessData.photoUrl}
                    alt={businessData.name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                </div>
              )}

              {/* Business Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                
                {/* Business Name */}
                <h2 
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '16px',
                    lineHeight: '1.3'
                  }}
                >
                  {businessData.name}
                </h2>

                {/* Address */}
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div 
                    style={{
                      width: '24px',
                      height: '24px',
                      background: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flex: '0 0 24px'
                    }}
                  >
                    📍
                  </div>
                  <p style={{ color: '#374151', fontSize: '16px', margin: 0, lineHeight: '1.5' }}>
                    {businessData.address}
                  </p>
                </div>

                {/* Phone Number */}
                {businessData.phoneNumber && (
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        background: '#06b6d4',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      📞
                    </div>
                    <p style={{ color: '#374151', fontSize: '16px', margin: 0 }}>
                      {businessData.phoneNumber}
                    </p>
                  </div>
                )}

                {/* Rating */}
                {businessData.rating && (
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        background: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ⭐
                    </div>
                    <p style={{ color: '#374151', fontSize: '16px', margin: 0 }}>
                      {businessData.rating} stars on Google
                    </p>
                  </div>
                )}

                {/* Website */}
                {businessData.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        background: '#8b5cf6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      🌐
                    </div>
                    <a 
                      href={businessData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#06b6d4', 
                        fontSize: '16px', 
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div 
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            
            {/* Yes, This Is Me Button */}
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                padding: '16px 32px',
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
              {isLoading ? '⏳ Processing...' : '➡️ Yes, This Is Me'}
            </button>

            {/* No, Try Again Button */}
            <button
              onClick={handleTryAgain}
              disabled={isLoading}
              style={{
                background: 'white',
                color: '#374151',
                padding: '16px 32px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: '2px solid #e5e7eb',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1,
                minWidth: '200px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              ↩️ No, Try Again
            </button>
          </div>

          {/* Helper Text */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Don't see your business? Click "No, Try Again" to search with different keywords.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BusinessVerify;
