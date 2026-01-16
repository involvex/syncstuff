import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  useIonToast,
} from "@ionic/react";
import { lockClosedOutline, fingerPrintOutline } from "ionicons/icons";
import type React from "react";
import { useSettingsStore } from "../../store/settings.store";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";

export const SecuritySettings: React.FC = () => {
  const { biometricLock, setBiometricLock } = useSettingsStore();
  const [presentToast] = useIonToast();

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      try {
        const result = await NativeBiometric.isAvailable();
        if (!result.isAvailable) {
          presentToast({
            message: "Biometric authentication is not available on this device",
            duration: 3000,
            color: "warning",
          });
          return;
        }

        // Try to authenticate once to verify it works before enabling
        const verified = await NativeBiometric.verifyIdentity({
          reason: "Verify identity to enable biometric lock",
          title: "Biometric Lock",
          subtitle: "Authenticate to enable",
          description: "This will be required to open the app",
        })
          .then(() => true)
          .catch(() => false);

        if (verified) {
          setBiometricLock(true);
          presentToast({
            message: "Biometric lock enabled",
            duration: 2000,
            color: "success",
          });
        } else {
          presentToast({
            message: "Authentication failed. Biometric lock not enabled.",
            duration: 2000,
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Biometric error:", error);
        presentToast({
          message: "Error setting up biometric authentication",
          duration: 2000,
          color: "danger",
        });
      }
    } else {
      setBiometricLock(false);
      presentToast({
        message: "Biometric lock disabled",
        duration: 2000,
        color: "medium",
      });
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={lockClosedOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Security</IonCardTitle>
            <IonCardSubtitle>Secure your app and data</IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="full">
          <IonItem>
            <IonIcon icon={fingerPrintOutline} slot="start" />
            <IonLabel>
              <h3>Biometric Lock</h3>
              <p>Require FaceID/Fingerprint to open the app</p>
            </IonLabel>
            <IonToggle
              checked={biometricLock}
              onIonChange={e => handleToggleBiometric(e.detail.checked)}
            />
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
