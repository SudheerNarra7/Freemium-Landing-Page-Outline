import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('BusinessService', () => {
  let service: BusinessService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-google-api-key'),
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
      providers: [
        BusinessService,
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

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have Google Maps client configured', () => {
    expect(service).toHaveProperty('googleMapsClient');
  });
});
