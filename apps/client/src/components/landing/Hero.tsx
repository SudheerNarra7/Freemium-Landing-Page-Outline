"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Extend Window interface to include Google Maps
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
    googleMapsLoading?: boolean; // Add a global flag to track loading state
  }
}

const Hero = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMapsAPI = () => {
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        return;
      }

      // Check if Google object exists but is still loading
      if (window.google) {
        // API is loaded but places library might still be loading
        const checkPlacesReady = () => {
          if (window.google.maps && window.google.maps.places) {
            initializeAutocomplete();
          } else {
            setTimeout(checkPlacesReady, 100);
          }
        };
        checkPlacesReady();
        return;
      }

      // Check if script is already being loaded or exists in DOM
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script already exists, wait for it to load
        const checkGoogleReady = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            initializeAutocomplete();
          } else {
            setTimeout(checkGoogleReady, 100);
          }
        };
        checkGoogleReady();
        return;
      }

      // Check if we're already in the process of loading (global flag)
      if (window.googleMapsLoading) {
        const checkGoogleReady = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            initializeAutocomplete();
          } else {
            setTimeout(checkGoogleReady, 100);
          }
        };
        checkGoogleReady();
        return;
      }

      // Set loading flag to prevent multiple simultaneous loads
      window.googleMapsLoading = true;

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAHL0ZAk9dbqkPPHms08kmx65chyCd-haQ&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set up callback function
      window.initMap = () => {
        window.googleMapsLoading = false; // Clear loading flag
        initializeAutocomplete();
      };

      // Handle script load errors
      script.onerror = () => {
        window.googleMapsLoading = false; // Clear loading flag on error
        console.error('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.AutocompleteService();
        setAutocompleteService(service);
        
        // Create a dummy map for PlacesService (required by Google)
        const map = new window.google.maps.Map(document.createElement('div'));
        const placesService = new window.google.maps.places.PlacesService(map);
        setPlacesService(placesService);
        
        setIsLoaded(true);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  const getPlaceDetails = (placeId: string, name: string) => {
    return new Promise((resolve) => {
      if (!placesService) {
        // Fallback data if Places service is not available
        resolve({
          placeId: placeId,
          name: name,
          address: "Address not available",
          phoneNumber: null,
          photoUrl: null,
          rating: null,
          website: null
        });
        return;
      }

      const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'photos', 'rating', 'website', 'place_id']
      };

      placesService.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const businessData = {
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address || "Address not available",
            phoneNumber: place.formatted_phone_number || null,
            photoUrl: place.photos && place.photos[0] ? place.photos[0].getUrl({maxWidth: 800, maxHeight: 600}) : null,
            rating: place.rating || null,
            website: place.website || null
          };
          resolve(businessData);
        } else {
          // Fallback data if API call fails
          resolve({
            placeId: placeId,
            name: name,
            address: "Address not available",
            phoneNumber: null,
            photoUrl: null,
            rating: null,
            website: null
          });
        }
      });
    });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value && autocompleteService && isLoaded) {
      autocompleteService.getPlacePredictions(
        {
          input: value,
          types: ['establishment'],
        },
        (predictions: any[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = async (suggestion: any) => {
    const description = suggestion.description;
    setSearchValue(description);
    setSuggestions([]);
    
    console.log("Selected business:", suggestion);
    
    // Get detailed place information
    try {
      const businessData = await getPlaceDetails(suggestion.place_id, suggestion.structured_formatting?.main_text || description);
      console.log("Business details:", businessData);
      
      // Navigate to verification step with business data
      const queryParams = new URLSearchParams({
        businessData: encodeURIComponent(JSON.stringify(businessData))
      });
      router.push(`/claim-listing/verify?${queryParams.toString()}`);
    } catch (error) {
      console.error("Error fetching business details:", error);
      // Navigate without data as fallback
      router.push('/claim-listing/verify');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue && suggestions.length > 0) {
      // If there are suggestions, use the first one
      await handleSelect(suggestions[0]);
    } else if (searchValue) {
      // If no suggestions but there's a search value, create basic data
      const basicBusinessData = {
        placeId: "manual-search",
        name: searchValue,
        address: "Address to be verified",
        phoneNumber: null,
        photoUrl: null,
        rating: null,
        website: null
      };
      
      const queryParams = new URLSearchParams({
        businessData: encodeURIComponent(JSON.stringify(basicBusinessData))
      });
      router.push(`/claim-listing/verify?${queryParams.toString()}`);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Background Image with Blur */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
          zIndex: 0
        }}
      />
      
      {/* Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.85) 0%, rgba(6, 182, 212, 0.85) 50%, rgba(59, 130, 246, 0.85) 100%)',
          zIndex: 1
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <header 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px 48px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px'
              }}
            >
              S
            </div>
            <span 
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '24px'
              }}
            >
              Swipe Savvy
            </span>
          </div>
        </header>

        {/* Main Content - Card Overlay */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 150px)',
            padding: '0 24px',
            textAlign: 'center'
          }}
        >
          {/* Central Card Overlay */}
          <div 
            style={{
              maxWidth: '900px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '32px',
              padding: '60px 40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            
            {/* Badge */}
            <div style={{ marginBottom: '32px' }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '20px' }}>✨</span>
                <span>Exclusive Invitation</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 
              style={{
                fontSize: 'clamp(40px, 8vw, 80px)',
                fontWeight: '900',
                color: 'white',
                marginBottom: '24px',
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}
            >
              You've Been Selected for a<br />
              <span 
                style={{
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Free Loyalty Listing
              </span>
            </h1>

            {/* Subheadline */}
            <p 
              style={{
                fontSize: 'clamp(18px, 3vw, 24px)',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '48px',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto 48px auto'
              }}
            >
              Your business has been recognized for its outstanding reputation. 
              Join the Swipe Savvy Rewards Network — completely free.
            </p>

            {/* Search Form */}
            <div style={{ maxWidth: '600px', margin: '0 auto 32px auto', position: 'relative' }}>
              <form onSubmit={handleSubmit}>
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchValue}
                      onChange={handleInput}
                      placeholder="Enter your business name or phone number"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '500',
                        padding: '16px 20px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: 'white',
                        color: '#374151',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '16px',
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
                      🔍 Search
                    </button>
                  </div>
                </div>

                {/* Autocomplete Suggestions */}
                {suggestions.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      borderRadius: '20px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      zIndex: 50,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.place_id || index}
                        type="button"
                        onClick={() => handleSelect(suggestion)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '16px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          borderRadius: index === 0 ? '20px 20px 0 0' : index === suggestions.length - 1 ? '0 0 20px 20px' : '0'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f9fafb';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#111827' }}>
                          {suggestion.structured_formatting?.main_text || suggestion.description}
                        </div>
                        {suggestion.structured_formatting?.secondary_text && (
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* CTA Button */}
            <div style={{ marginBottom: '32px' }}>
              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  background: 'white',
                  color: '#374151',
                  padding: '24px 32px',
                  borderRadius: '20px',
                  fontSize: '20px',
                  fontWeight: '900',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                🔍 Locate Your Business to Claim Your Free Listing
              </button>
            </div>

            {/* Helper Text */}
            <p 
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '18px',
                marginBottom: '48px',
                lineHeight: '1.6'
              }}
            >
              We'll find your business and you can confirm the correct one in the next step.
              <br />
              <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>No credit card required.</span>
            </p>

            {/* Trust Indicators */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#166534',
                    fontWeight: 'bold'
                  }}
                >
                  ✓
                </div>
                <span style={{ fontWeight: '600' }}>100% Free</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }}
                >
                  🔒
                </div>
                <span style={{ fontWeight: '600' }}>Secure & Safe</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#a855f7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    fontWeight: 'bold'
                  }}
                >
                  ⚡
                </div>
                <span style={{ fontWeight: '600' }}>2 Min Setup</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 