import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useSettingsStore } from "../store/settings.store";
import { getPlatform } from "../utils/platform.utils";
import "./SettingsPage.css";

const SettingsPage: React.FC = () => {
  const { deviceName, deviceId, initialize } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="settings-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Device Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h3>Device Name</h3>
                    <p>{deviceName || "Loading..."}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Device ID</h3>
                    <p className="device-id">{deviceId || "Loading..."}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Platform</h3>
                    <p>{getPlatform()}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Appearance</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>Theme</IonLabel>
                  <ThemeToggle />
                </IonItem>
              </IonList>
              <IonText color="medium">
                <p style={{ marginTop: "10px", fontSize: "0.875rem" }}>
                  Choose between Light, Dark, or System theme. System will match
                  your device's theme preference.
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>About</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>
                  <strong>Syncstuff MVP</strong>
                </p>
                <p>Version 0.1.0 - Phase 1: Foundation</p>
                <p style={{ marginTop: "10px" }}>
                  A local-first file synchronization app built with Ionic React.
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
