"use client";

import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Swipe Savvy transformed our customer loyalty program. We've seen a 40% increase in repeat customers!",
      author: "Sarah Johnson",
      business: "Bloom Coffee Shop",
      avatar: "SJ",
      rating: 5
    },
    {
      quote: "The rewards network brought new customers through our doors every day. Absolutely game-changing!",
      author: "Mike Chen",
      business: "Chen's Family Restaurant",
      avatar: "MC",
      rating: 5
    },
    {
      quote: "Easy to set up and our customers love earning points. Best investment we've made for our business.",
      author: "Lisa Rodriguez",
      business: "Bella's Boutique",
      avatar: "LR",
      rating: 5
    },
    {
      quote: "Our customer engagement doubled within the first month. The analytics dashboard is incredible.",
      author: "David Thompson",
      business: "Thompson Auto Care",
      avatar: "DT",
      rating: 5
    },
    {
      quote: "Simple setup, immediate results. Our customers are more engaged than ever before.",
      author: "Jennifer Kim",
      business: "Fresh Market Deli",
      avatar: "JK",
      rating: 5
    },
    {
      quote: "The support team is amazing and the platform just works. Highly recommend!",
      author: "Robert Martinez",
      business: "Martinez Auto Shop",
      avatar: "RM",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Businesses", icon: "🏪" },
    { number: "50%", label: "Avg. Customer Retention", icon: "📈" },
    { number: "2 min", label: "Setup Time", icon: "⚡" },
    { number: "24/7", label: "Customer Support", icon: "🎧" }
  ];

  return (
    <div 
      style={{
        background: '#f9fafb',
        padding: '80px 0',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div 
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#d1fae5',
              color: '#047857',
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '24px',
              fontWeight: 'bold'
            }}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            <span>Success Stories</span>
          </div>
          
          <h2 
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: '900',
              color: '#111827',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}
          >
            What Our{" "}
            <span 
              style={{
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Partners
            </span>{" "}
            Are Saying
          </h2>
          
          <p 
            style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            Join thousands of businesses that have transformed their customer relationships and increased their revenue
          </p>
        </div>

        {/* Testimonials Scrolling Section */}
        <div 
          style={{
            overflow: 'hidden',
            marginBottom: '80px',
            position: 'relative'
          }}
        >
          <div 
            style={{
              display: 'flex',
              gap: '32px',
              animation: 'scroll 60s linear infinite',
              width: 'calc(400px * 12)' // 6 testimonials × 2 (for seamless loop)
            }}
          >
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6',
                  minWidth: '400px',
                  flex: '0 0 400px'
                }}
              >
                
                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} style={{ width: '20px', height: '20px', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote 
                  style={{
                    color: '#374151',
                    fontSize: '18px',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                    fontWeight: '500',
                    fontStyle: 'italic'
                  }}
                >
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                      {testimonial.author}
                    </div>
                    <div style={{ color: '#6b7280', fontWeight: '500' }}>
                      {testimonial.business}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless scrolling */}
            {testimonials.map((testimonial, index) => (
              <div 
                key={`duplicate-${index}`} 
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6',
                  minWidth: '400px',
                  flex: '0 0 400px'
                }}
              >
                
                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} style={{ width: '20px', height: '20px', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote 
                  style={{
                    color: '#374151',
                    fontSize: '18px',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                    fontWeight: '500',
                    fontStyle: 'italic'
                  }}
                >
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                      {testimonial.author}
                    </div>
                    <div style={{ color: '#6b7280', fontWeight: '500' }}>
                      {testimonial.business}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div 
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            marginBottom: '64px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 
              style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: '900',
                color: '#111827',
                marginBottom: '16px'
              }}
            >
              Ready to join these{" "}
              <span 
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                successful businesses?
              </span>
            </h3>
            <p style={{ fontSize: '20px', color: '#6b7280' }}>
              Start building stronger customer relationships today with our free loyalty program.
            </p>
          </div>

          {/* Stats Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              marginBottom: '48px'
            }}
          >
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{stat.icon}</div>
                <div 
                  style={{
                    fontSize: 'clamp(36px, 5vw, 56px)',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '8px'
                  }}
                >
                  {stat.number}
                </div>
                <div style={{ color: '#6b7280', fontWeight: '600', fontSize: '18px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                color: 'white',
                padding: '24px 48px',
                borderRadius: '20px',
                fontSize: '20px',
                fontWeight: '900',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(16, 185, 129, 0.3)';
              }}
            >
              Start Your Free Listing Today
            </button>
            <p style={{ color: '#6b7280', marginTop: '24px', fontSize: '18px' }}>
              <span style={{ fontWeight: 'bold' }}>No credit card required</span> • Free forever • Setup in minutes
            </p>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div 
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            color: 'white'
          }}
        >
          <h4 
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: '900',
              marginBottom: '16px'
            }}
          >
            Don't Miss This Exclusive Opportunity
          </h4>
          <p 
            style={{
              fontSize: '20px',
              marginBottom: '32px',
              opacity: 0.9
            }}
          >
            This invitation expires soon. Claim your free loyalty listing now.
          </p>
          <button 
            style={{
              background: 'white',
              color: '#374151',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '900',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            Claim My Free Listing →
          </button>
        </div>

      </div>
    </div>
  );
};

export default Testimonials;
