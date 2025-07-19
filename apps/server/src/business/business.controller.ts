import { Controller, Get, Query, Param, Put, Delete, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('find-google-place')
  async findGooglePlace(@Query('query') query: string) {
    if (!query) {
      throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
    }
    return this.businessService.findGooglePlace(query);
  }

  @Get('place-details/:placeId')
  async getPlaceDetails(@Param('placeId') placeId: string) {
    try {
      return await this.businessService.getPlaceDetails(placeId);
    } catch (error) {
      throw new HttpException('Failed to fetch place details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllBusinesses() {
    try {
      return await this.businessService.getAllBusinesses();
    } catch (error) {
      throw new HttpException('Failed to fetch businesses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getBusinessById(@Param('id') id: string) {
    try {
      const business = await this.businessService.getBusinessById(id);
      if (!business) {
        throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
      }
      return business;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('by-place-id/:googlePlaceId')
  async getBusinessByGooglePlaceId(@Param('googlePlaceId') googlePlaceId: string) {
    try {
      const business = await this.businessService.getBusinessByGooglePlaceId(googlePlaceId);
      if (!business) {
        throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
      }
      return business;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateData: { name?: string; address?: string; phone?: string }
  ) {
    try {
      return await this.businessService.updateBusiness(id, updateData);
    } catch (error) {
      throw new HttpException('Failed to update business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteBusiness(@Param('id') id: string) {
    try {
      await this.businessService.deleteBusiness(id);
      return { message: 'Business deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete business', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
