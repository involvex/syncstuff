import type { CloudProvider, CloudProviderType } from "../../types/cloud.types";
import { GoogleDriveService } from "./providers/google-drive.service";
import { MockCloudService } from "./providers/mock-cloud.service";
import { MegaService } from "./providers/mega.service";
import { SyncstuffService } from "./providers/syncstuff.service";

class CloudManagerService {
  private providers: Map<CloudProviderType, CloudProvider> = new Map();

  constructor() {
    this.registerProvider(new MockCloudService());
    this.registerProvider(new GoogleDriveService());
    this.registerProvider(new MegaService());
    this.registerProvider(new SyncstuffService());
  }

  registerProvider(provider: CloudProvider) {
    this.providers.set(provider.type, provider);
  }

  getProvider(type: CloudProviderType): CloudProvider | undefined {
    return this.providers.get(type);
  }

  getAllProviders(): CloudProvider[] {
    return Array.from(this.providers.values());
  }

  async initializeAll() {
    for (const provider of this.providers.values()) {
      try {
        await provider.initialize();
      } catch (error) {
        console.error(`Failed to initialize ${provider.name}:`, error);
      }
    }
  }
}

export const cloudManagerService = new CloudManagerService();
