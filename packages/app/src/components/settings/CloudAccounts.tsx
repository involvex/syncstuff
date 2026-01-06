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
} from "ionicons/icons";
import { useCloudStore } from "../../store/cloud.store";
import { cloudManagerService } from "../../services/cloud/cloud-manager.service";
import type { CloudProviderType } from "../../types/cloud.types";

export const CloudAccounts: React.FC = () => {
  const { accounts, addAccount, removeAccount } = useCloudStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAccount = async (type: CloudProviderType) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const provider = cloudManagerService.getProvider(type);
      if (!provider) throw new Error("Provider not found");

      const account = await provider.authenticate();
      addAccount(account);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to authenticate");
      }
    } finally {
      setIsAuthenticating(false);
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
            onClick={() => handleAddAccount("google")}
            disabled={isAuthenticating}
          >
            <IonIcon slot="start" icon={logoGoogle} />
            {isAuthenticating ? (
              <IonSpinner name="dots" />
            ) : (
              "Connect Google Drive"
            )}
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

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Authentication Error"
          message={error || "Unknown error"}
          buttons={["OK"]}
        />
      </IonCardContent>
    </IonCard>
  );
};
