import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessService {
  private googleMapsClient: Client;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.googleMapsClient = new Client({});
  }

  async findGooglePlace(query: string) {
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Places API key is not configured.');
    }

    try {
      const response = await this.googleMapsClient.findPlaceFromText({
        params: {
          input: query,
          inputtype: PlaceInputType.textQuery,
          fields: ['place_id', 'name', 'formatted_address', 'international_phone_number'], // Fixed: changed from formatted_phone_number to international_phone_number
          key: apiKey,
        },
      });

      return response.data.candidates.map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        phoneNumber: place.international_phone_number, // Fixed: using international_phone_number
      }));
    } catch (error) {
      console.error('Error searching Google Places:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string) {
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Places API key is not configured.');
    }

    try {
      const response = await this.googleMapsClient.placeDetails({
        params: {
          place_id: placeId,
          fields: ['place_id', 'name', 'formatted_address', 'international_phone_number', 'photos', 'rating', 'website'],
          key: apiKey,
        },
      });

      const place = response.data.result;
      
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        phoneNumber: place.international_phone_number,
        rating: place.rating,
        website: place.website,
        photos: place.photos ? place.photos.map(photo => ({
          photoReference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })) : [],
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw new Error('Failed to fetch place details');
    }
  }

  async getAllBusinesses() {
    return this.prisma.business.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getBusinessById(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getBusinessByGooglePlaceId(googlePlaceId: string) {
    return this.prisma.business.findUnique({
      where: { googlePlaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async updateBusiness(id: string, updateData: { name?: string; address?: string; phone?: string }) {
    return this.prisma.business.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteBusiness(id: string) {
    return this.prisma.business.delete({
      where: { id },
    });
  }
}
