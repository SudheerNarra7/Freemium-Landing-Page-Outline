const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  hasAcceptedTerms: boolean;
  business?: Business;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  phone: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  hasAcceptedTerms?: boolean;
}

export interface CreateBusinessDto {
  googlePlaceId: string;
  name: string;
  address: string;
  phone: string;
}

export interface CreateSubscriptionDto {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface GooglePlace {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
  rating?: number;
  website?: string;
  openingHours?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // User endpoints
  async createUser(userData: CreateUserDto): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async createBusiness(userId: string, businessData: CreateBusinessDto): Promise<Business> {
    return this.request<Business>(`/users/${userId}/business`, {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  // Business endpoints
  async findGooglePlace(query: string): Promise<GooglePlace[]> {
    const encodedQuery = encodeURIComponent(query);
    return this.request<GooglePlace[]>(`/business/find-google-place?query=${encodedQuery}`);
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    return this.request<PlaceDetails>(`/business/place-details/${placeId}`);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return this.request<Business[]>('/business');
  }

  async getBusinessById(id: string): Promise<Business> {
    return this.request<Business>(`/business/${id}`);
  }

  async getBusinessByGooglePlaceId(googlePlaceId: string): Promise<Business> {
    return this.request<Business>(`/business/by-place-id/${googlePlaceId}`);
  }

  async updateBusiness(
    id: string,
    updateData: { name?: string; address?: string; phone?: string }
  ): Promise<Business> {
    return this.request<Business>(`/business/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteBusiness(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/business/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription endpoints
  async createCheckoutSession(subscriptionData: CreateSubscriptionDto): Promise<{ url: string }> {
    return this.request<{ url: string }>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.request<Subscription[]>(`/subscriptions/user/${userId}`);
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      return await this.request<Subscription>(`/subscriptions/user/${userId}/active`);
    } catch (error) {
      // Return null if no active subscription found
      return null;
    }
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/subscriptions/user/${userId}/portal`, {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for potential custom instances
export { ApiClient }; 