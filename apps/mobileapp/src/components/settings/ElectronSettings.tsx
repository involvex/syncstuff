import {
  IonButton,
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
import {
  appsOutline,
  closeOutline,
  desktopOutline,
  expandOutline,
  removeOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { isElectron } from "../../utils/electron.utils";

export const ElectronSettings: React.FC = () => {
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [presentToast] = useIonToast();

  useEffect(() => {
    setIsElectronApp(isElectron());

    // Load minimize to tray preference
    const stored = localStorage.getItem("electron_minimize_to_tray");
    if (stored !== null) {
      setMinimizeToTray(stored === "true");
    }
  }, []);

  const handleMinimize = async () => {
    try {
      await window.electron?.windowMinimize();
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
      await window.electron?.windowMaximize();
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
        await window.electron?.windowHide();
        presentToast({
          message: "Minimized to tray",
          duration: 2000,
          color: "success",
        });
      } else {
        await window.electron?.windowClose();
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

  if (!isElectronApp) {
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
