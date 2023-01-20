import { Test, TestingModule } from '@nestjs/testing';
import { SettingsGateway } from './settings.gateway';

describe('SettingsGateway', () => {
  let gateway: SettingsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsGateway],
    }).compile();

    gateway = module.get<SettingsGateway>(SettingsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
