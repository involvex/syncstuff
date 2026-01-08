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
  IonToggle,
  IonInput,
} from "@ionic/react";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useSettingsStore } from "../store/settings.store";
import { getPlatform } from "../utils/platform.utils";
import "./SettingsPage.css";
import pkg from "../../package.json";

import { CloudAccounts } from "../components/settings/CloudAccounts";
import { PermissionsSettings } from "../components/settings/PermissionsSettings";
import { NotificationSettings } from "../components/settings/NotificationSettings";
import { ElectronSettings } from "../components/settings/ElectronSettings";
import { ConnectionSettings } from "../components/settings/ConnectionSettings";

const SettingsPage: React.FC = () => {
  const {
    deviceName,
    deviceId,
    initialize,
    devMode,
    setDevMode,
    verboseLogging,
    setVerboseLogging,
    traceHandshake,
    setTraceHandshake,
    signalingServerUrl,
    setSignalingServerUrl,
  } = useSettingsStore();

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

          <CloudAccounts />

          <PermissionsSettings />

          <NotificationSettings />

          <ConnectionSettings />

          <ElectronSettings />

          {devMode && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Developer Options</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Verbose Logging</IonLabel>
                    <IonToggle
                      checked={verboseLogging}
                      onIonChange={e => setVerboseLogging(e.detail.checked)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel>Trace Handshake</IonLabel>
                    <IonToggle
                      checked={traceHandshake}
                      onIonChange={e => setTraceHandshake(e.detail.checked)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Signaling Server URL</IonLabel>
                    <IonInput
                      value={signalingServerUrl}
                      onIonChange={e => setSignalingServerUrl(e.detail.value!)}
                      placeholder="http://localhost:3001"
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Appearance & Debug</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>Theme</IonLabel>
                  <ThemeToggle />
                </IonItem>
                <IonItem>
                  <IonLabel>Developer Mode</IonLabel>
                  <IonToggle
                    checked={devMode}
                    onIonChange={e => setDevMode(e.detail.checked)}
                  />
                </IonItem>
              </IonList>
              <IonText color="medium">
                <p style={{ marginTop: "10px", fontSize: "0.875rem" }}>
                  Choose between Light, Dark, or System theme. Global developer
                  mode enables advanced logging and connection controls.
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
                  <strong>Syncstuff</strong>
                </p>
                <p>Version {pkg.version}</p>
                <p style={{ marginTop: "10px" }}>{pkg.description}</p>
                <p style={{ marginTop: "10px" }}>
                  <a
                    href={pkg.repository.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    color: "var(--ion-color-medium)",
                  }}
                >
                  Author: {pkg.author.name}
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
