import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonText,
} from "@ionic/react";
import { lockClosedOutline, fingerPrintOutline } from "ionicons/icons";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useSettingsStore } from "../../store/settings.store";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { App as CapacitorApp } from "@capacitor/app";

interface BiometricLockGuardProps {
  children: React.ReactNode;
}

export const BiometricLockGuard: React.FC<BiometricLockGuardProps> = ({
  children,
}) => {
  const { biometricLock, initialized } = useSettingsStore();
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const verify = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Unlock SyncStuff to access your data",
          title: "App Locked",
          subtitle: "Authenticate to continue",
        });
        setIsLocked(false);
      } else {
        setIsLocked(false);
      }
    } catch (error) {
      console.error("Biometric verification failed:", error);
      setIsLocked(true);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    if (initialized && biometricLock) {
      setIsLocked(true);
      verify();
    }
  }, [initialized, biometricLock, verify]);

  useEffect(() => {
    const listener = CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive && biometricLock) {
        setIsLocked(true);
      } else if (isActive && biometricLock && isLocked) {
        verify();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [biometricLock, isLocked, verify]);

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "var(--ion-color-primary-tiny, rgba(56, 128, 255, 0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IonIcon
              icon={lockClosedOutline}
              style={{ fontSize: "40px", color: "var(--ion-color-primary)" }}
            />
          </div>

          <div>
            <IonText color="dark">
              <h1 style={{ fontWeight: "bold", marginBottom: "8px" }}>App Locked</h1>
            </IonText>
            <IonText color="medium">
              <p>Biometric authentication is required to access SyncStuff</p>
            </IonText>
          </div>

          <IonButton
            expand="block"
            onClick={verify}
            shape="round"
            style={{ width: "200px" }}
          >
            <IonIcon icon={fingerPrintOutline} slot="start" />
            Unlock App
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};
