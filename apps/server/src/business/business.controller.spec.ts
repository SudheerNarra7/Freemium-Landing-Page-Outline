import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('BusinessController', () => {
  let controller: BusinessController;
  let businessService: BusinessService;

  const mockBusinessService = {
    findGooglePlace: jest.fn(),
    getPlaceDetails: jest.fn(),
    getAllBusinesses: jest.fn(),
    getBusinessById: jest.fn(),
    getBusinessByPlaceId: jest.fn(),
    updateBusiness: jest.fn(),
    deleteBusiness: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-api-key'),
  };

  const mockPrismaService = {
    business: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        {
          provide: BusinessService,
          useValue: mockBusinessService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
    businessService = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findGooglePlace with query', async () => {
    const query = 'test business';
    const mockResult = [{ placeId: '123', name: 'Test Business' }];
    mockBusinessService.findGooglePlace.mockResolvedValue(mockResult);

    const result = await controller.findGooglePlace(query);

    expect(businessService.findGooglePlace).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockResult);
  });

  it('should call getPlaceDetails with placeId', async () => {
    const placeId = 'test-place-id';
    const mockResult = { placeId, name: 'Test Place', address: 'Test Address' };
    mockBusinessService.getPlaceDetails.mockResolvedValue(mockResult);

    const result = await controller.getPlaceDetails(placeId);

    expect(businessService.getPlaceDetails).toHaveBeenCalledWith(placeId);
    expect(result).toEqual(mockResult);
  });
});
