import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  useIonToast,
} from "@ionic/react";
import { globeOutline, refreshOutline, serverOutline } from "ionicons/icons";
import React, { useState } from "react";
import { useSettingsStore } from "../../store/settings.store";

export const ConnectionSettings: React.FC = () => {
  const { signalingServerUrl, setSignalingServerUrl } = useSettingsStore();
  const [url, setUrl] = useState(signalingServerUrl);
  const [presentToast] = useIonToast();

  const handleSave = () => {
    if (!url) {
      presentToast({
        message: "URL cannot be empty",
        duration: 2000,
        color: "danger",
      });
      return;
    }

    try {
      new URL(url); // Validate URL format
      setSignalingServerUrl(url);
      presentToast({
        message: "Signaling server URL updated",
        duration: 2000,
        color: "success",
      });
    } catch (_error) {
      presentToast({
        message: "Invalid URL format",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const handleReset = () => {
    const defaultUrl = "http://localhost:3001";
    setUrl(defaultUrl);
    setSignalingServerUrl(defaultUrl);
    presentToast({
      message: "Reset to default signaling server",
      duration: 2000,
      color: "medium",
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={serverOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Connection Settings</IonCardTitle>
            <IonCardSubtitle>
              Signaling server for WebRTC pairing
            </IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <p
          style={{
            marginBottom: "16px",
            fontSize: "0.9em",
            color: "var(--ion-color-medium)",
          }}
        >
          The signaling server is used to exchange connection info between
          devices during pairing. If you are on a local network, use your PC's
          IP address (e.g., http://192.168.1.5:3001).
        </p>
        <IonList lines="full">
          <IonItem>
            <IonIcon icon={globeOutline} slot="start" />
            <IonLabel position="stacked">Signaling Server URL</IonLabel>
            <IonInput
              value={url}
              placeholder="http://localhost:3001"
              onIonChange={e => setUrl(e.detail.value || "")}
              type="url"
            />
          </IonItem>
        </IonList>

        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
          <IonButton expand="block" style={{ flex: 1 }} onClick={handleSave}>
            Save URL
          </IonButton>
          <IonButton expand="block" fill="outline" onClick={handleReset}>
            <IonIcon icon={refreshOutline} slot="icon-only" />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
