import { Test, TestingModule } from '@nestjs/testing';
import { AssetLifecycleController } from './asset-lifecycle.controller';

describe('AssetLifecycleController', () => {
  let controller: AssetLifecycleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetLifecycleController],
    }).compile();

    controller = module.get<AssetLifecycleController>(AssetLifecycleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
