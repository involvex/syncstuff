import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonToggle,
  useIonToast,
} from "@ionic/react";
import {
  desktopOutline,
  removeOutline,
  expandOutline,
  closeOutline,
  appsOutline,
} from "ionicons/icons";
import { electronService } from "../../services/electron/electron.service";
import { Capacitor } from "@capacitor/core";

export const ElectronSettings: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [presentToast] = useIonToast();

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsElectron(platform === "electron");

    // Load minimize to tray preference
    const stored = localStorage.getItem("electron_minimize_to_tray");
    if (stored !== null) {
      setMinimizeToTray(stored === "true");
    }
  }, []);

  const handleMinimize = async () => {
    try {
      await electronService.minimize();
      presentToast({
        message: "Window minimized",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Failed to minimize:", error);
      presentToast({
        message: "Failed to minimize window",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const handleMaximize = async () => {
    try {
      await electronService.maximize();
      presentToast({
        message: "Window maximized",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Failed to maximize:", error);
      presentToast({
        message: "Failed to maximize window",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const handleClose = async () => {
    try {
      if (minimizeToTray) {
        await electronService.hideWindow();
        presentToast({
          message: "Minimized to tray",
          duration: 2000,
          color: "success",
        });
      } else {
        await electronService.close();
      }
    } catch (error) {
      console.error("Failed to close:", error);
    }
  };

  const handleToggleMinimizeToTray = (value: boolean) => {
    setMinimizeToTray(value);
    localStorage.setItem("electron_minimize_to_tray", String(value));
    presentToast({
      message: `Minimize to tray ${value ? "enabled" : "disabled"}`,
      duration: 2000,
      color: "success",
    });
  };

  if (!isElectron || !electronService.isAvailable()) {
    return null;
  }

  return (
    <IonCard className="electron-settings-card">
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={desktopOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Desktop Controls</IonCardTitle>
            <IonCardSubtitle>Window and tray settings</IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="full">
          <IonItem>
            <IonIcon icon={removeOutline} slot="start" />
            <IonLabel>
              <h3>Minimize Window</h3>
              <p>Minimize the application window</p>
            </IonLabel>
            <IonButton
              fill="outline"
              size="small"
              onClick={handleMinimize}
              slot="end"
            >
              Minimize
            </IonButton>
          </IonItem>

          <IonItem>
            <IonIcon icon={expandOutline} slot="start" />
            <IonLabel>
              <h3>Maximize Window</h3>
              <p>Maximize the application window</p>
            </IonLabel>
            <IonButton
              fill="outline"
              size="small"
              onClick={handleMaximize}
              slot="end"
            >
              Maximize
            </IonButton>
          </IonItem>

          <IonItem>
            <IonIcon icon={appsOutline} slot="start" />
            <IonLabel>
              <h3>Minimize to Tray</h3>
              <p>When closing window, minimize to system tray instead</p>
            </IonLabel>
            <IonToggle
              checked={minimizeToTray}
              onIonChange={e => handleToggleMinimizeToTray(e.detail.checked)}
              slot="end"
            />
          </IonItem>

          <IonItem>
            <IonIcon icon={closeOutline} slot="start" />
            <IonLabel>
              <h3>Close Window</h3>
              <p>
                {minimizeToTray
                  ? "Will minimize to tray"
                  : "Will close the application"}
              </p>
            </IonLabel>
            <IonButton
              fill="outline"
              color="danger"
              size="small"
              onClick={handleClose}
              slot="end"
            >
              Close
            </IonButton>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
