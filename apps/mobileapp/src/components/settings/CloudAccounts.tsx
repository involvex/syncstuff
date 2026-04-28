import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonSpinner,
  IonText,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  cloudOutline,
  cloudUploadOutline,
  informationCircleOutline,
  linkOutline,
  logoGoogle,
  personCircleOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  trashOutline,
  warningOutline,
} from "ionicons/icons";
import type React from "react";
import { useEffect, useState } from "react";
import { cloudManagerService } from "../../services/cloud/cloud-manager.service";
import { useCloudStore } from "../../store/cloud.store";
import type { CloudProviderType } from "../../types/cloud.types";

export const CloudAccounts: React.FC = () => {
  const { accounts, addAccount, removeAccount, updateAccount } =
    useCloudStore();
  const [isAuthenticating, setIsAuthenticating] =
    useState<CloudProviderType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  // Ensure disabled is always a boolean to avoid Ionic component issues
  // Use Boolean() to explicitly convert to boolean type
  const isAnyAuthenticating = Boolean(isAuthenticating);

  useEffect(() => {
    // Initialize all providers on mount
    cloudManagerService.initializeAll().catch(error => {
      console.error("Failed to initialize cloud providers:", error);
    });

    // Refresh account info periodically
    const refreshInterval = setInterval(() => {
      accounts.forEach(account => {
        cloudManagerService
          .refreshAccountInfo(account.provider)
          .then(updated => {
            if (updated) {
              updateAccount(account.id, updated);
            }
          });
      });
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [accounts, updateAccount]);

  const handleSyncstuffLogin = async (data: Record<string, string>) => {
    if (!data.email || !data.password) {
      presentToast({
        message: "Please enter both email and password",
        duration: 2000,
        color: "warning",
        icon: warningOutline,
      });
      return;
    }

    setIsAuthenticating("syncstuff");
    try {
      const account = await cloudManagerService.authenticate("syncstuff", {
        email: data.email,
        password: data.password,
      });
      addAccount(account);

      // Trigger device auto-registration when account is added
      try {
        const { deviceDetectionService } = await import(
          "../../services/device/device-detection.service"
        );
        await deviceDetectionService.autoRegisterDevice();
      } catch (error) {
        console.warn("Failed to auto-register device:", error);
      }

      // Link account for Electron sync
      try {
        const { electronSyncService } = await import(
          "../../services/electron/sync.service"
        );
        await electronSyncService.linkAccount(account);
      } catch (error) {
        console.warn("Failed to link account for Electron sync:", error);
      }

      presentToast({
        message: "Successfully connected to SyncStuff",
        duration: 2000,
        color: "success",
        icon: checkmarkCircleOutline,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      presentAlert({
        header: "Login Failed",
        message: errorMsg,
        buttons: [
          {
            text: "OK",
            role: "cancel",
          },
        ],
        cssClass: "error-alert",
      });
    } finally {
      setIsAuthenticating(null);
    }
  };

  const handleMegaLogin = async (data: Record<string, string>) => {
    if (!data.email || !data.password) {
      presentToast({
        message: "Please enter both email and password",
        duration: 2000,
        color: "warning",
        icon: warningOutline,
      });
      return;
    }

    setIsAuthenticating("mega");
    try {
      const account = await cloudManagerService.authenticate("mega", {
        email: data.email,
        password: data.password,
      });
      addAccount(account);
      presentToast({
        message: "Successfully connected to MEGA",
        duration: 2000,
        color: "success",
        icon: checkmarkCircleOutline,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      presentAlert({
        header: "Login Failed",
        message: errorMsg,
        buttons: [
          {
            text: "OK",
            role: "cancel",
          },
        ],
        cssClass: "error-alert",
      });
    } finally {
      setIsAuthenticating(null);
    }
  };

  const showSyncstuffLoginAlert = () => {
    presentAlert({
      header: "Connect to SyncStuff",
      subHeader: "Sign in to your SyncStuff account",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: "Enter your email",
          attributes: {
            required: true,
            autocomplete: "email",
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Enter your password",
          attributes: {
            required: true,
            autocomplete: "current-password",
          },
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "alert-button-cancel",
        },
        {
          text: "Connect",
          handler: handleSyncstuffLogin,
          cssClass: "alert-button-confirm",
        },
      ],
      cssClass: "modern-alert",
    });
  };

  const showMegaLoginAlert = () => {
    presentAlert({
      header: "Connect to MEGA",
      subHeader: "Sign in to your MEGA account",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: "Enter your email",
          attributes: {
            required: true,
            autocomplete: "email",
          },
        },
        {
          name: "password",
          type: "password",
          placeholder: "Enter your password",
          attributes: {
            required: true,
            autocomplete: "current-password",
          },
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "alert-button-cancel",
        },
        {
          text: "Connect",
          handler: handleMegaLogin,
          cssClass: "alert-button-confirm",
        },
      ],
      cssClass: "modern-alert",
    });
  };

  const handleAddAccount = async (type: CloudProviderType) => {
    // Check if already authenticated
    if (cloudManagerService.isAuthenticated(type)) {
      presentToast({
        message: `${cloudManagerService.getProvider(type)?.name} is already connected`,
        duration: 2000,
        color: "warning",
        icon: informationCircleOutline,
      });
      return;
    }

    setIsAuthenticating(type);
    try {
      if (type === "syncstuff") {
        showSyncstuffLoginAlert();
        setIsAuthenticating(null);
        return;
      }

      if (type === "mega") {
        showMegaLoginAlert();
        setIsAuthenticating(null);
        return;
      }

      const account = await cloudManagerService.authenticate(type);
      addAccount(account);

      // Trigger device auto-registration when account is added
      try {
        const { deviceDetectionService } = await import(
          "../../services/device/device-detection.service"
        );
        await deviceDetectionService.autoRegisterDevice();
      } catch (error) {
        console.warn("Failed to auto-register device:", error);
      }

      // Link account for Electron sync
      try {
        const { electronSyncService } = await import(
          "../../services/electron/sync.service"
        );
        await electronSyncService.linkAccount(account);
      } catch (error) {
        console.warn("Failed to link account for Electron sync:", error);
      }

      presentToast({
        message: `Successfully connected to ${cloudManagerService.getProvider(type)?.name}`,
        duration: 2000,
        color: "success",
        icon: checkmarkCircleOutline,
      });
    } catch (err: unknown) {
      console.error("Auth Error:", err);
      let errorMessage = "Failed to authenticate";

      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific Google Drive error
        if (
          errorMessage.includes("Storage relay URI") ||
          errorMessage === "invalid_client"
        ) {
          errorMessage =
            "Google Drive Configuration Error: The Client ID used is likely for 'Android' but the app is using the Web SDK. Please create a new 'Web application' Client ID in Google Cloud Console and use that instead.";
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      presentAlert({
        header: "Authentication Error",
        message: errorMessage,
        buttons: [
          {
            text: "OK",
            role: "cancel",
          },
        ],
        cssClass: "error-alert",
      });
    } finally {
      setIsAuthenticating(null);
    }
  };

  const handleRemoveAccount = async (
    accountId: string,
    type: CloudProviderType,
  ) => {
    presentAlert({
      header: "Disconnect Account?",
      message: `Are you sure you want to disconnect ${cloudManagerService.getProvider(type)?.name}?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "alert-button-cancel",
        },
        {
          text: "Disconnect",
          role: "destructive",
          handler: async () => {
            try {
              await cloudManagerService.disconnect(type);
              removeAccount(accountId);

              // Unlink account from Electron sync
              try {
                const { electronSyncService } = await import(
                  "../../services/electron/sync.service"
                );
                await electronSyncService.unlinkAccount(type);
              } catch (error) {
                console.warn(
                  "Failed to unlink account from Electron sync:",
                  error,
                );
              }

              presentToast({
                message: "Account disconnected successfully",
                duration: 2000,
                color: "success",
                icon: checkmarkCircleOutline,
              });
            } catch (err) {
              console.error("Failed to disconnect:", err);
              presentToast({
                message: "Failed to disconnect account",
                duration: 2000,
                color: "danger",
                icon: closeCircleOutline,
              });
            }
          },
          cssClass: "alert-button-destructive",
        },
      ],
      cssClass: "modern-alert",
    });
  };

  const handleRefreshAccount = async (
    accountId: string,
    type: CloudProviderType,
  ) => {
    setIsRefreshing(accountId);
    try {
      const updated = await cloudManagerService.refreshAccountInfo(type);
      if (updated) {
        updateAccount(accountId, updated);
        presentToast({
          message: "Account information refreshed",
          duration: 2000,
          color: "success",
          icon: refreshOutline,
        });
      }
    } catch (err) {
      console.error("Failed to refresh account:", err);
      presentToast({
        message: "Failed to refresh account information",
        duration: 2000,
        color: "warning",
        icon: warningOutline,
      });
    } finally {
      setIsRefreshing(null);
    }
  };

  const getIcon = (type: CloudProviderType) => {
    switch (type) {
      case "google":
        return logoGoogle;
      case "mock":
        return cloudUploadOutline;
      case "syncstuff":
        return personCircleOutline;
      default:
        return cloudOutline;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const getQuotaPercentage = (used?: number, total?: number): number => {
    if (!used || !total || total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  return (
    <IonCard className="cloud-accounts-card">
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={cloudOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Cloud Accounts</IonCardTitle>
            <IonCardSubtitle>
              Manage your connected cloud storage services
            </IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        {accounts.length > 0 ? (
          <IonList className="accounts-list" lines="full">
            {accounts.map(account => {
              const quotaPercent = getQuotaPercentage(
                account.quotaUsed,
                account.quotaTotal,
              );
              const accountIsRefreshing = isRefreshing === account.id;

              return (
                <IonItem
                  button={false}
                  className="account-item"
                  key={account.id}
                >
                  <IonAvatar className="account-avatar" slot="start">
                    {account.avatarUrl ? (
                      <img alt={account.name} src={account.avatarUrl} />
                    ) : (
                      <IonIcon
                        icon={getIcon(account.provider)}
                        style={{ fontSize: "24px" }}
                      />
                    )}
                  </IonAvatar>
                  <IonLabel className="account-label">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <h2>{account.name}</h2>
                      {account.isAuthenticated && (
                        <IonBadge color="success" style={{ fontSize: "10px" }}>
                          <IonIcon
                            icon={checkmarkCircleOutline}
                            style={{ fontSize: "12px", marginRight: "2px" }}
                          />
                          Connected
                        </IonBadge>
                      )}
                    </div>
                    <p className="account-email">{account.email}</p>
                    {account.quotaUsed !== undefined &&
                      account.quotaTotal !== undefined && (
                        <div className="quota-info">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <IonText
                              color={
                                quotaPercent > 90
                                  ? "danger"
                                  : quotaPercent > 75
                                    ? "warning"
                                    : "medium"
                              }
                              style={{ fontSize: "0.85em" }}
                            >
                              {formatBytes(account.quotaUsed)} /{" "}
                              {formatBytes(account.quotaTotal)}
                            </IonText>
                            <IonChip
                              color={
                                quotaPercent > 90
                                  ? "danger"
                                  : quotaPercent > 75
                                    ? "warning"
                                    : "primary"
                              }
                              style={{ fontSize: "0.75em", height: "20px" }}
                            >
                              {quotaPercent.toFixed(1)}%
                            </IonChip>
                          </div>
                          <IonProgressBar
                            color={
                              quotaPercent > 90
                                ? "danger"
                                : quotaPercent > 75
                                  ? "warning"
                                  : "primary"
                            }
                            style={{ height: "6px", borderRadius: "3px" }}
                            value={quotaPercent / 100}
                          />
                        </div>
                      )}
                    {account.lastSync && (
                      <IonText
                        color="medium"
                        style={{
                          fontSize: "0.75em",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Last synced:{" "}
                        {new Date(account.lastSync).toLocaleString()}
                      </IonText>
                    )}
                  </IonLabel>
                  <div slot="end" style={{ display: "flex", gap: "4px" }}>
                    <IonButton
                      disabled={Boolean(accountIsRefreshing)}
                      fill="clear"
                      onClick={() =>
                        handleRefreshAccount(account.id, account.provider)
                      }
                      size="small"
                    >
                      {accountIsRefreshing ? (
                        <IonSpinner name="crescent" />
                      ) : (
                        <IonIcon icon={refreshOutline} />
                      )}
                    </IonButton>
                    <IonButton
                      color="danger"
                      fill="clear"
                      onClick={() =>
                        handleRemoveAccount(account.id, account.provider)
                      }
                      size="small"
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        ) : (
          <div className="empty-state">
            <IonIcon
              icon={cloudOutline}
              style={{
                fontSize: "64px",
                color: "var(--ion-color-medium)",
                marginBottom: "16px",
              }}
            />
            <IonText color="medium">
              <h3 style={{ marginBottom: "8px" }}>No accounts connected</h3>
              <p>
                Link your cloud accounts to sync files across devices and access
                your files from anywhere.
              </p>
            </IonText>
          </div>
        )}

        <div className="connect-buttons" style={{ marginTop: "24px" }}>
          <IonButton
            className="provider-button syncstuff-button"
            disabled={Boolean(isAnyAuthenticating)}
            expand="block"
            fill="solid"
            onClick={() => handleAddAccount("syncstuff")}
            style={{
              marginBottom: "12px",
              "--background":
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {isAuthenticating === "syncstuff" ? (
              <IonSpinner name="crescent" slot="start" />
            ) : (
              <IonIcon icon={personCircleOutline} slot="start" />
            )}
            {isAuthenticating === "syncstuff"
              ? "Connecting..."
              : "Connect SyncStuff"}
            <IonIcon icon={linkOutline} slot="end" />
          </IonButton>

          <IonButton
            className="provider-button google-button"
            disabled={Boolean(isAnyAuthenticating)}
            expand="block"
            fill="solid"
            onClick={() => handleAddAccount("google")}
            style={{
              marginBottom: "12px",
              "--background":
                "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
            }}
          >
            {isAuthenticating === "google" ? (
              <IonSpinner name="crescent" slot="start" />
            ) : (
              <IonIcon icon={logoGoogle} slot="start" />
            )}
            {isAuthenticating === "google"
              ? "Connecting..."
              : "Connect Google Drive"}
            <IonIcon icon={shieldCheckmarkOutline} slot="end" />
          </IonButton>

          <IonButton
            className="provider-button mega-button"
            disabled={Boolean(isAnyAuthenticating)}
            expand="block"
            fill="outline"
            onClick={() => handleAddAccount("mega")}
            style={{
              marginBottom: "12px",
              "--border-color": "var(--ion-color-danger)",
              "--color": "var(--ion-color-danger)",
            }}
          >
            {isAuthenticating === "mega" ? (
              <IonSpinner name="crescent" slot="start" />
            ) : (
              <IonIcon icon={cloudOutline} slot="start" />
            )}
            {isAuthenticating === "mega" ? "Connecting..." : "Connect MEGA"}
          </IonButton>

          {/* Mock Provider for Testing */}
          <IonButton
            className="provider-button mock-button"
            color="medium"
            disabled={Boolean(isAnyAuthenticating)}
            expand="block"
            fill="clear"
            onClick={() => handleAddAccount("mock")}
            size="small"
          >
            <IonIcon icon={cloudUploadOutline} slot="start" />
            Connect Mock Cloud (Test)
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
