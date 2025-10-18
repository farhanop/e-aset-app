import { Test, TestingModule } from '@nestjs/testing';
import { AssetLifecycleService } from './asset-lifecycle.service';

describe('AssetLifecycleService', () => {
  let service: AssetLifecycleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetLifecycleService],
    }).compile();

    service = module.get<AssetLifecycleService>(AssetLifecycleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
