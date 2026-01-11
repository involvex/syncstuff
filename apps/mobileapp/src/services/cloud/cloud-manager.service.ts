import type {
  CloudAccount,
  CloudProvider,
  CloudProviderType,
} from "../../types/cloud.types";
import { GoogleDriveService } from "./providers/google-drive.service";
import { MegaService } from "./providers/mega.service";
import { MockCloudService } from "./providers/mock-cloud.service";
import { SyncstuffService } from "./providers/syncstuff.service";

interface ProviderState {
  provider: CloudProvider;
  account: CloudAccount | null;
  isInitialized: boolean;
  isAuthenticating: boolean;
  lastError: Error | null;
}

class CloudManagerService {
  private providers: Map<CloudProviderType, CloudProvider> = new Map();
  private providerStates: Map<CloudProviderType, ProviderState> = new Map();
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.registerProvider(new MockCloudService());
    this.registerProvider(new GoogleDriveService());
    this.registerProvider(new MegaService());
    this.registerProvider(new SyncstuffService());
  }

  registerProvider(provider: CloudProvider) {
    this.providers.set(provider.type, provider);
    this.providerStates.set(provider.type, {
      provider,
      account: null,
      isInitialized: false,
      isAuthenticating: false,
      lastError: null,
    });
  }

  getProvider(type: CloudProviderType): CloudProvider | undefined {
    return this.providers.get(type);
  }

  getAllProviders(): CloudProvider[] {
    return Array.from(this.providers.values());
  }

  getProviderState(type: CloudProviderType): ProviderState | undefined {
    return this.providerStates.get(type);
  }

  async initializeAll(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = Promise.all(
      Array.from(this.providerStates.values()).map(async state => {
        try {
          await state.provider.initialize();
          state.isInitialized = true;
          state.lastError = null;

          // Try to restore existing accounts
          if (state.provider.type === "syncstuff") {
            const syncstuffProvider = state.provider as SyncstuffService;
            if (syncstuffProvider instanceof SyncstuffService) {
              try {
                const account = await syncstuffProvider.getAccountInfo();
                if (account) {
                  state.account = account;
                }
              } catch (_error) {
                // Token might be expired, that's okay
                console.log("No valid SyncStuff session found");
              }
            }
          }
        } catch (error) {
          console.error(`Failed to initialize ${state.provider.name}:`, error);
          state.lastError =
            error instanceof Error ? error : new Error(String(error));
        }
      }),
    ).then(() => {
      this.initializationPromise = null;
    });

    return this.initializationPromise;
  }

  async authenticate(
    type: CloudProviderType,
    credentials?: { email: string; password: string },
  ): Promise<CloudAccount> {
    const state = this.providerStates.get(type);
    if (!state) {
      throw new Error(`Provider ${type} not found`);
    }

    state.isAuthenticating = true;
    state.lastError = null;

    try {
      let account: CloudAccount;

      if (type === "syncstuff" && credentials) {
        const syncstuffProvider = state.provider as SyncstuffService;
        if (!(syncstuffProvider instanceof SyncstuffService)) {
          throw new Error("SyncStuff provider is not properly initialized");
        }
        account = await syncstuffProvider.login(
          credentials.email,
          credentials.password,
        );
      } else if (type === "mega" && credentials) {
        const megaProvider = state.provider as MegaService;
        if (!(megaProvider instanceof MegaService)) {
          throw new Error("MEGA provider is not properly initialized");
        }
        account = await megaProvider.login(
          credentials.email,
          credentials.password,
        );
      } else {
        account = await state.provider.authenticate();
      }

      state.account = account;
      state.lastError = null;

      // Update quota information
      try {
        const quota = await state.provider.getQuota();
        state.account.quotaUsed = quota.used;
        state.account.quotaTotal = quota.total;
      } catch (error) {
        console.warn(`Failed to fetch quota for ${type}:`, error);
      }

      return account;
    } catch (error) {
      state.lastError =
        error instanceof Error ? error : new Error(String(error));
      throw error;
    } finally {
      state.isAuthenticating = false;
    }
  }

  async disconnect(type: CloudProviderType): Promise<void> {
    const state = this.providerStates.get(type);
    if (!state) {
      throw new Error(`Provider ${type} not found`);
    }

    try {
      await state.provider.disconnect();
      state.account = null;
      state.lastError = null;
    } catch (error) {
      state.lastError =
        error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  getAccount(type: CloudProviderType): CloudAccount | null {
    return this.providerStates.get(type)?.account ?? null;
  }

  isAuthenticated(type: CloudProviderType): boolean {
    const state = this.providerStates.get(type);
    return state?.account?.isAuthenticated ?? false;
  }

  isAuthenticating(type: CloudProviderType): boolean {
    return this.providerStates.get(type)?.isAuthenticating ?? false;
  }

  getLastError(type: CloudProviderType): Error | null {
    return this.providerStates.get(type)?.lastError ?? null;
  }

  async refreshAccountInfo(
    type: CloudProviderType,
  ): Promise<CloudAccount | null> {
    const state = this.providerStates.get(type);
    if (!state || !state.account) {
      return null;
    }

    try {
      // Refresh quota information
      const quota = await state.provider.getQuota();
      state.account.quotaUsed = quota.used;
      state.account.quotaTotal = quota.total;
      state.account.lastSync = new Date();

      return state.account;
    } catch (error) {
      console.error(`Failed to refresh account info for ${type}:`, error);
      return state.account;
    }
  }
}

export const cloudManagerService = new CloudManagerService();
