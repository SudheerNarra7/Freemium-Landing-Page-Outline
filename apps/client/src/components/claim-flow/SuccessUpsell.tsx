'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

const SuccessUpsell = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Generate confetti on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const particles = [...Array(20)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
      }));
      setConfettiParticles(particles);
    }
  }, []);

  // Check for payment success and load user data
  useEffect(() => {
    // Get user data from localStorage - only on client side
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('swipeSavvyUser');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }

    // Check if redirected from successful payment
    try {
      const paymentSuccess = searchParams.get('payment_success');
      if (paymentSuccess === 'true') {
        setShowPaymentSuccess(true);
      }
    } catch (error) {
      console.error('Error reading search params:', error);
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (!userData) {
      alert('User data not found. Please complete the signup process first.');
      return;
    }

    // Show payment form instead of redirecting to Stripe
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData) {
      alert('User data not found. Please complete the signup process first.');
      return;
    }

    setIsUpgrading(true);
    
    try {
      // Submit payment data to backend
      const paymentSubmission = {
        userId: userData.id,
        priceId: 'price_premium',
        amount: 3450, // $34.50 in cents
        currency: 'USD',
        paymentDetails: {
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''), // Remove spaces
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv,
          cardholderName: paymentData.cardholderName,
          billingAddress: paymentData.billingAddress
        },
        planDetails: {
          name: 'Shop Savvy Pro',
          price: '$34.50/month',
          features: [
            'Featured placement in our app',
            'Run 2x rewards promotions',
            'Sync across Google, Yelp, Facebook',
            'Advanced analytics & reports',
            'Priority phone & chat support',
            'Custom branding & themes'
          ]
        }
      };

      const response = await fetch('http://localhost:3001/subscriptions/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentSubmission)
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Hide payment form and show success
        setShowPaymentForm(false);
        setShowPaymentSuccess(true);
        setIsUpgrading(false);
        
        console.log('Payment processed successfully:', result);
      } else {
        throw new Error(result.message || 'Payment processing failed');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      alert(`Payment failed: ${error.message}. Please check your payment details and try again.`);
      setIsUpgrading(false);
    }
  };

  const handlePaymentInputChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
    }
    return numbers;
  };

  const isFormValid = () => {
    return (
      paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
      paymentData.expiryDate.length === 5 &&
      paymentData.cvv.length >= 3 &&
      paymentData.cardholderName.trim().length > 0 &&
      paymentData.billingAddress.street.trim().length > 0 &&
      paymentData.billingAddress.city.trim().length > 0 &&
      paymentData.billingAddress.state.trim().length > 0 &&
      paymentData.billingAddress.zipCode.trim().length > 0
    );
  };

  const handleGoToLogin = () => {
    console.log('Redirecting to Swipe Savvy Rewards dashboard...');
    // Redirect to Swipe Savvy Rewards website
    window.location.href = 'https://www.swipesavvyrewards.com/';
  };

  const handleStayFree = () => {
    console.log('User chose to stay on free plan, redirecting...');
    // Redirect to Swipe Savvy website
    window.location.href = 'https://www.swipesavvyrewards.com/';
  };

  const handleListAnotherBusiness = () => {
    console.log('User wants to list another business, routing to step 1...');
    // Route back to the main page (step 1)
    router.push('/');
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      business: "Chen's Coffee Corner",
      location: "Austin, TX",
      text: "Shop Savvy increased my customer retention by 45% in just 3 months. The analytics showed me exactly when to run promotions.",
      rating: 5,
      revenue: "+$2,400/month"
    },
    {
      name: "Mike Rodriguez",
      business: "Rodriguez Auto Repair",
      location: "Phoenix, AZ", 
      text: "The Google and Yelp sync saved me hours each week. My listing went from buried to featured, bringing in 30% more customers.",
      rating: 5,
      revenue: "+$1,800/month"
    },
    {
      name: "Lisa Thompson",
      business: "Bloom Flower Shop",
      location: "Denver, CO",
      text: "The 2x rewards promotions during holidays were incredible. Customers kept coming back and spending more each visit.",
      rating: 5,
      revenue: "+$3,200/month"
    },
    {
      name: "David Park",
      business: "Park's Korean BBQ",
      location: "Los Angeles, CA",
      text: "Shop Savvy's featured placement brought me customers I never would have reached. ROI paid for itself in the first month.",
      rating: 5,
      revenue: "+$5,600/month"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      
      {/* Confetti Animation - Client Side Only */}
      {confettiParticles.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.left}%`,
                top: '-10px',
                width: '10px',
                height: '10px',
                background: particle.color,
                borderRadius: '50%',
                animation: `confetti-fall 3s linear infinite`,
                animationDelay: `${particle.delay}s`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '48px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Success Animation */}
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                fontSize: '40px',
                color: 'white',
                animation: 'success-bounce 0.6s ease-out'
              }}
            >
              ✓
            </div>

            {/* Success Message */}
            <h2 
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '16px'
              }}
            >
              🎉 Payment Successful!
            </h2>
            
            <p 
              style={{
                fontSize: '18px',
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}
            >
              Welcome to <strong>Shop Savvy Pro!</strong><br/>
              Your account has been upgraded and all premium features are now active.
            </p>

            {/* Benefits Recap */}
            <div 
              style={{
                background: '#f9fafb',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '32px',
                border: '1px solid #e5e7eb'
              }}
            >
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '16px'
                }}
              >
                🚀 Your Premium Features Are Now Active:
              </h3>
              <div style={{ textAlign: 'left' }}>
                {[
                  'Featured placement in our app',
                  'Run 2x rewards promotions',
                  'Sync across Google, Yelp, Facebook',
                  'Advanced analytics & reports'
                ].map((feature, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}
                  >
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleGoToLogin}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
              }}
            >
              🚀 Go to Dashboard & Start Using Pro Features
            </button>

            {/* Additional Info */}
            <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
              You'll be redirected to <strong>swipesavvyrewards.com</strong> to access your dashboard.
              <br/>
              Your login credentials have been sent to your email.
            </p>
          </div>
        </div>
              )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentForm(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111827',
                  marginBottom: '8px'
                }}
              >
                🚀 Complete Your Upgrade to Shop Savvy Pro
              </h2>
              <p 
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}
              >
                Enter your payment details to unlock all premium features
              </p>
              <div 
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  color: '#166534'
                }}
              >
                💳 Secure payment • 30-day money-back guarantee • Cancel anytime
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit}>
              {/* Card Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px'
                  }}
                >
                  💳 Card Information
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => handlePaymentInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => handlePaymentInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => handlePaymentInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardholderName}
                    onChange={(e) => handlePaymentInputChange('cardholderName', e.target.value)}
                    placeholder="Sudheer Narra"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div style={{ marginBottom: '32px' }}>
                <h3 
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px'
                  }}
                >
                  📍 Billing Address
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.street}
                    onChange={(e) => handlePaymentInputChange('billingAddress.street', e.target.value)}
                    placeholder="1234 Elm Street"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      value={paymentData.billingAddress.city}
                      onChange={(e) => handlePaymentInputChange('billingAddress.city', e.target.value)}
                      placeholder="Dallas"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      value={paymentData.billingAddress.state}
                      onChange={(e) => handlePaymentInputChange('billingAddress.state', e.target.value)}
                      placeholder="TX"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={paymentData.billingAddress.zipCode}
                    onChange={(e) => handlePaymentInputChange('billingAddress.zipCode', e.target.value)}
                    placeholder="75201"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      maxWidth: '200px'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div 
                style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <h4 
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '12px'
                  }}
                >
                  📋 Order Summary
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Shop Savvy Pro (monthly)</span>
                  <span style={{ fontWeight: '600' }}>$34.50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280' }}>First month discount</span>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>-$34.50</span>
                </div>
                <hr style={{ margin: '12px 0', border: '1px solid #e5e7eb' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
                  <span>Total due today</span>
                  <span style={{ color: '#10b981' }}>$0.00</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
                  🎉 Your first month is FREE! Starting next month: $34.50/month (50% off forever)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid() || isUpgrading}
                style={{
                  width: '100%',
                  background: isFormValid() && !isUpgrading ? 
                    'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' : '#9ca3af',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: isFormValid() && !isUpgrading ? 'pointer' : 'not-allowed',
                  boxShadow: isFormValid() && !isUpgrading ? 
                    '0 10px 25px -5px rgba(16, 185, 129, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px'
                }}
              >
                {isUpgrading ? '⏳ Processing Payment...' : '🔥 Complete Upgrade - FREE Trial'}
              </button>

              <div 
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}
              >
                🔒 Your payment information is secure and encrypted.<br/>
                By continuing, you agree to our terms of service.
              </div>
            </form>
          </div>
        </div>
      )}


       <div 
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}
      >
        
        {/* Top Action Bar - List Another Business */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '16px 24px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div>
            <h3 
              style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                margin: 0,
                marginBottom: '4px'
              }}
            >
              🎯 Want to grow your business empire?
            </h3>
            <p 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                margin: 0
              }}
            >
              List additional businesses and maximize your reach across multiple locations
            </p>
          </div>
          
          <button
            onClick={handleListAnotherBusiness}
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -5px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(245, 158, 11, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(245, 158, 11, 0.4)';
            }}
          >
            ➕ List One More Business
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
              Step 4 of 4 - Complete! 🎉
            </span>
          </div>
          <div 
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '4px',
                animation: 'progress-complete 1s ease-out'
              }}
            />
          </div>
        </div>

        {/* Main Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 
            style={{
              fontSize: 'clamp(32px, 6vw, 64px)',
              fontWeight: '900',
              color: 'white',
              marginBottom: '20px',
              lineHeight: '1.1',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            🎉 Your Business Is Now Live on Swipe Savvy!
          </h1>
          <p 
            style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.5',
              maxWidth: '800px',
              margin: '0 auto',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            Make the most of it with a limited-time upgrade — first month free + 50% off for life.
          </p>
        </div>

        {/* Comparison Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '32px',
            marginBottom: '80px'
          }}
        >
          
          {/* Free Plan Card */}
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '3px solid #10b981',
              position: 'relative'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#10b981',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✅ ACTIVE NOW
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111827',
                  marginBottom: '8px'
                }}
              >
                Free Plan
              </h3>
              <p 
                style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  marginBottom: '16px'
                }}
              >
                Great for getting started
              </p>
              <div 
                style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#10b981'
                }}
              >
                $0<span style={{ fontSize: '18px', fontWeight: '400' }}>/month</span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              {[
                'Basic business listing',
                'Standard loyalty program',
                'Monthly analytics reports',
                'Email support',
                'Window sticker & POS signage'
              ].map((feature, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      background: '#10b981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ color: '#374151', fontSize: '16px' }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Free Plan CTA Button */}
            <button
              onClick={handleStayFree}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
              }}
            >
              🚀 Access My Free Dashboard
            </button>

            <div 
              style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}
            >
              Click above to access your dashboard at <strong>swipesavvyrewards.com</strong>
            </div>
          </div>

          {/* Upgrade Card */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              color: 'white',
              position: 'relative',
              border: '3px solid #f59e0b'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#f59e0b',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔥 LIMITED TIME
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  marginBottom: '8px'
                }}
              >
                Shop Savvy Pro
              </h3>
              <p 
                style={{
                  fontSize: '18px',
                  opacity: 0.9,
                  marginBottom: '16px'
                }}
              >
                Maximize your growth potential
              </p>
              <div style={{ marginBottom: '8px' }}>
                <span 
                  style={{
                    fontSize: '20px',
                    textDecoration: 'line-through',
                    opacity: 0.7
                  }}
                >
                  $69/mo
                </span>
              </div>
              <div 
                style={{
                  fontSize: '48px',
                  fontWeight: '900'
                }}
              >
                $34.50<span style={{ fontSize: '18px', fontWeight: '400' }}>/month</span>
              </div>
              <div 
                style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginTop: '4px'
                }}
              >
                50% off forever + FREE first month
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}
              >
                ✅ Upgrade to Shop Savvy and unlock:
              </h4>
              {[
                'Featured placement in our app',
                'Run 2x rewards promotions',
                'Sync your listing across Google, Yelp, Facebook & more',
                'Access analytics and performance reports',
                'Priority phone & chat support',
                'Custom branding & themes',
                'Advanced customer segmentation',
                'Automated marketing campaigns'
              ].map((feature, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
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
                    ✓
                  </div>
                  <span style={{ fontSize: '16px' }}>{feature}</span>
                </div>
              ))}
            </div>

            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                💸 Try it FREE for 30 days — then just $34.50/mo (50% off forever)
              </p>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>
                Cancel anytime. No setup fees. No contracts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.2s ease',
                  opacity: isUpgrading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isUpgrading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(245, 158, 11, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isUpgrading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(245, 158, 11, 0.4)';
                  }
                }}
              >
                {isUpgrading ? '⏳ Processing...' : '🔥 Yes, Upgrade Me — Risk-Free'}
              </button>

              <button
                onClick={handleStayFree}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                ➡️ No Thanks, I'll Stay on the Free Plan
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div 
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '12px'
              }}
            >
              💬 What Shop Savvy Merchants Say
            </h3>
            <p 
              style={{
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              Real results from businesses just like yours
            </p>
          </div>

          {/* Testimonial Card */}
          <div 
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            <div 
              style={{
                background: '#f9fafb',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Stars */}
              <div style={{ marginBottom: '20px' }}>
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <span key={i} style={{ fontSize: '24px', color: '#f59e0b' }}>⭐</span>
                ))}
              </div>

              {/* Quote */}
              <blockquote 
                style={{
                  fontSize: '20px',
                  lineHeight: '1.6',
                  color: '#374151',
                  fontStyle: 'italic',
                  marginBottom: '24px',
                  fontWeight: '500'
                }}
              >
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              {/* Revenue Highlight */}
              <div 
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                📈 {testimonials[currentTestimonial].revenue}
              </div>

              {/* Author */}
              <div>
                <div 
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '4px'
                  }}
                >
                  {testimonials[currentTestimonial].name}
                </div>
                <div 
                  style={{
                    fontSize: '16px',
                    color: '#6b7280'
                  }}
                >
                  {testimonials[currentTestimonial].business} • {testimonials[currentTestimonial].location}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                background: '#10b981',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ←
            </button>

            <button
              onClick={nextTestimonial}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                background: '#10b981',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              →
            </button>
          </div>

          {/* Dots Indicator */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentTestimonial ? '#10b981' : '#d1d5db',
                  margin: '0 4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Final Message */}
        <div 
          style={{
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '32px',
            borderRadius: '20px',
            color: 'white'
          }}
        >
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>
            🚀 Ready to grow your business with Swipe Savvy?
          </p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Your materials will ship within 5-7 business days. Welcome to the family!
          </p>
        </div>

      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes progress-complete {
          0% { width: 75%; }
          100% { width: 100%; }
        }

        @keyframes success-bounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessUpsell;
