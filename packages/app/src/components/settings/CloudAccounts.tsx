import React, { useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  useIonAlert,
} from "@ionic/react";
import {
  cloudOutline,
  trashOutline,
  logoGoogle,
  cloudUploadOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useCloudStore } from "../../store/cloud.store";
import { cloudManagerService } from "../../services/cloud/cloud-manager.service";
import type { CloudProviderType } from "../../types/cloud.types";
import { SyncstuffService } from "../../services/cloud/providers/syncstuff.service";
import { MegaService } from "../../services/cloud/providers/mega.service";

export const CloudAccounts: React.FC = () => {
  const { accounts, addAccount, removeAccount } = useCloudStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [presentAlert] = useIonAlert();

  const handleSyncstuffLogin = async (data: Record<string, string>) => {
    setIsAuthenticating(true);
    try {
      const provider = cloudManagerService.getProvider("syncstuff");
      if (provider instanceof SyncstuffService) {
        const account = await provider.login(data.email, data.password);
        addAccount(account);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      presentAlert({
        header: "Login Failed",
        message: errorMsg,
        buttons: ["OK"],
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMegaLogin = async (data: Record<string, string>) => {
    setIsAuthenticating(true);
    try {
      const provider = cloudManagerService.getProvider("mega");
      if (provider instanceof MegaService) {
        const account = await provider.login(data.email, data.password);
        addAccount(account);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      presentAlert({
        header: "Login Failed",
        message: errorMsg,
        buttons: ["OK"],
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const showSyncstuffLoginAlert = () => {
    presentAlert({
      header: "Login to Syncstuff",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: "Email",
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Login",
          handler: handleSyncstuffLogin,
        },
      ],
    });
  };

  const showMegaLoginAlert = () => {
    presentAlert({
      header: "Login to Mega",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: "Email",
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Login",
          handler: handleMegaLogin,
        },
      ],
    });
  };

  const handleAddAccount = async (type: CloudProviderType) => {
    setIsAuthenticating(true);
    try {
      const provider = cloudManagerService.getProvider(type);
      if (!provider) throw new Error("Provider not found");

      if (type === "syncstuff") {
        showSyncstuffLoginAlert();
        setIsAuthenticating(false);
        return;
      }

      if (type === "mega") {
        showMegaLoginAlert();
        setIsAuthenticating(false);
        return;
      }

      const account = await provider.authenticate();
      addAccount(account);
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

      // If we didn't show a login dialog (which handles its own errors), show generic error
      if (type !== "syncstuff" && type !== "mega") {
        presentAlert({
          header: "Authentication Error",
          message: errorMessage,
          buttons: ["OK"],
        });
      }
    } finally {
      if (type !== "syncstuff" && type !== "mega") {
        setIsAuthenticating(false);
      }
    }
  };

  const handleRemoveAccount = async (
    accountId: string,
    type: CloudProviderType,
  ) => {
    try {
      const provider = cloudManagerService.getProvider(type);
      if (provider) {
        await provider.disconnect();
      }
      removeAccount(accountId);
    } catch (err) {
      console.error("Failed to disconnect:", err);
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

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Cloud Accounts</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {accounts.map(account => (
            <IonItem key={account.id}>
              <IonIcon slot="start" icon={getIcon(account.provider)} />
              <IonLabel>
                <h2>{account.name}</h2>
                <p>{account.email}</p>
                {account.quotaUsed !== undefined &&
                  account.quotaTotal !== undefined && (
                    <p
                      style={{
                        fontSize: "0.8em",
                        color: "var(--ion-color-medium)",
                      }}
                    >
                      {Math.round(account.quotaUsed / 1024 / 1024)}MB /{" "}
                      {Math.round(account.quotaTotal / 1024 / 1024)}MB used
                    </p>
                  )}
              </IonLabel>
              <IonButton
                fill="clear"
                color="danger"
                slot="end"
                onClick={() =>
                  handleRemoveAccount(account.id, account.provider)
                }
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}

          {accounts.length === 0 && (
            <div className="ion-text-center ion-padding">
              <IonText color="medium">
                <p>Link your cloud accounts to sync files across devices.</p>
              </IonText>
            </div>
          )}
        </IonList>

        <div className="ion-padding-top">
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => handleAddAccount("syncstuff")}
            disabled={isAuthenticating}
          >
            <IonIcon slot="start" icon={personCircleOutline} />
            {isAuthenticating &&
              // We can't easily know if it's THIS button causing loading if we use a single state,
              // but for now simple spinner is fine or we can omit it since the alert opens instantly.
              // Let's keep the spinner logic simple or remove it for the dialog-based ones.
              /* simpler to just show text */
              null}
            Connect Syncstuff
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            onClick={() => handleAddAccount("google")}
            disabled={isAuthenticating}
          >
            <IonIcon slot="start" icon={logoGoogle} />
            Connect Google Drive
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            onClick={() => handleAddAccount("mega")}
            disabled={isAuthenticating}
            color="danger"
          >
            <IonIcon slot="start" icon={cloudOutline} />
            Connect Mega
          </IonButton>

          {/* Mock Provider for Testing */}
          <IonButton
            expand="block"
            fill="clear"
            size="small"
            onClick={() => handleAddAccount("mock")}
            disabled={isAuthenticating}
            color="medium"
          >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Connect Mock Cloud (Test)
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
