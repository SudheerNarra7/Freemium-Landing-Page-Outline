import BusinessSearch from '@/components/claim-flow/BusinessSearch';
import BusinessVerify from '@/components/claim-flow/BusinessVerify';
import AccountCreate from '@/components/claim-flow/AccountCreate';
import TermsAndConditions from '@/components/claim-flow/TermsAndConditions';
import SuccessUpsell from '@/components/claim-flow/SuccessUpsell';

interface ClaimListingPageProps {
  params: Promise<{
    step?: string[];
  }>;
  searchParams: Promise<{
    businessData?: string;
  }>;
}

export default async function ClaimListingPage({ params, searchParams }: ClaimListingPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const currentStep = resolvedParams.step?.[0] || 'search';

  // Parse business data from URL if available
  let businessData = null;
  if (resolvedSearchParams.businessData) {
    try {
      businessData = JSON.parse(decodeURIComponent(resolvedSearchParams.businessData));
    } catch (error) {
      console.error('Error parsing business data:', error);
    }
  }

  // Default sample business data as fallback
  const sampleBusinessData = {
    placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "Desi Mandi",
    address: "2540 E University Dr, Denton, TX 76209, United States",
    phoneNumber: "+1 (940) 383-1122",
    photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.3,
    website: "https://desimandi.com"
  };

  switch (currentStep) {
    case 'search':
      return <BusinessSearch />;
    
    case 'verify':
      return <BusinessVerify businessData={businessData || sampleBusinessData} />;
    
    case 'account-create':
      return <AccountCreate />;
    
    case 'terms':
      return <TermsAndConditions />;
    
    case 'success':
      return <SuccessUpsell />;
    
    default:
      return <BusinessSearch />;
  }
}
