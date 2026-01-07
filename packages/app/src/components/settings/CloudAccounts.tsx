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
  IonSpinner,
  IonText,
  IonAlert,
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
  const [error, setError] = useState<string | null>(null);
  const [showSyncstuffLogin, setShowSyncstuffLogin] = useState(false);
  const [showMegaLogin, setShowMegaLogin] = useState(false);

  const handleAddAccount = async (type: CloudProviderType) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const provider = cloudManagerService.getProvider(type);
      if (!provider) throw new Error("Provider not found");

      if (type === "syncstuff") {
        setShowSyncstuffLogin(true);
        setIsAuthenticating(false);
        return;
      }

      if (type === "mega") {
        setShowMegaLogin(true);
        setIsAuthenticating(false);
        return;
      }

      const account = await provider.authenticate();
      addAccount(account);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "CREDENTIALS_REQUIRED") {
        if (type === "syncstuff") setShowSyncstuffLogin(true);
        if (type === "mega") setShowMegaLogin(true);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to authenticate");
      }
    } finally {
      if (type !== "syncstuff" && type !== "mega") {
        setIsAuthenticating(false);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSyncstuffLogin = async (data: any) => {
    setIsAuthenticating(true);

    try {
      const provider = cloudManagerService.getProvider("syncstuff");

      if (provider instanceof SyncstuffService) {
        const account = await provider.login(data.email, data.password);
        addAccount(account);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    } finally {
      setIsAuthenticating(false);
      setShowSyncstuffLogin(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMegaLogin = async (data: any) => {
    setIsAuthenticating(true);

    try {
      const provider = cloudManagerService.getProvider("mega");

      if (provider instanceof MegaService) {
        const account = await provider.login(data.email, data.password);
        addAccount(account);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    } finally {
      setIsAuthenticating(false);
      setShowMegaLogin(false);
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
            {isAuthenticating && showSyncstuffLogin ? (
              <IonSpinner name="dots" />
            ) : (
              "Connect Syncstuff"
            )}
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
            {isAuthenticating && showMegaLogin ? (
              <IonSpinner name="dots" />
            ) : (
              "Connect Mega"
            )}
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

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Authentication Error"
          message={error || "Unknown error"}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={showSyncstuffLogin}
          onDidDismiss={() => setShowSyncstuffLogin(false)}
          header="Login to Syncstuff"
          inputs={[
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
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => setShowSyncstuffLogin(false),
            },
            {
              text: "Login",
              handler: data => handleSyncstuffLogin(data),
            },
          ]}
        />

        <IonAlert
          isOpen={showMegaLogin}
          onDidDismiss={() => setShowMegaLogin(false)}
          header="Login to Mega"
          inputs={[
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
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => setShowMegaLogin(false),
            },
            {
              text: "Login",
              handler: data => handleMegaLogin(data),
            },
          ]}
        />
      </IonCardContent>
    </IonCard>
  );
};
