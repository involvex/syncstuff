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
  IonToggle,
  IonButton,
  IonIcon,
  IonBadge,
  useIonToast,
} from "@ionic/react";
import {
  notificationsOutline,
  checkmarkCircleOutline,
  cloudOutline,
  swapHorizontalOutline,
  phonePortraitOutline,
} from "ionicons/icons";
import { notificationService } from "../../services/notifications/notification.service";
import { localStorageService } from "../../services/storage/local-storage.service";

interface NotificationPreferences {
  enabled: boolean;
  syncNotifications: boolean;
  cloudNotifications: boolean;
  transferNotifications: boolean;
  deviceNotifications: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    syncNotifications: true,
    cloudNotifications: true,
    transferNotifications: true,
    deviceNotifications: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "default"
  >("default");
  const [presentToast] = useIonToast();

  useEffect(() => {
    loadPreferences();
    checkPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      const enabled =
        (await localStorageService.get<boolean>("notifications_enabled")) ??
        false;
      const syncNotifications =
        (await localStorageService.get<boolean>("notifications_sync")) ?? true;
      const cloudNotifications =
        (await localStorageService.get<boolean>("notifications_cloud")) ?? true;
      const transferNotifications =
        (await localStorageService.get<boolean>("notifications_transfer")) ??
        true;
      const deviceNotifications =
        (await localStorageService.get<boolean>("notifications_device")) ??
        true;

      setPreferences({
        enabled,
        syncNotifications,
        cloudNotifications,
        transferNotifications,
        deviceNotifications,
      });
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  };

  const checkPermission = async () => {
    const status = await notificationService.checkPermission();
    setPermissionStatus(status);
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermissionStatus("granted");
      setPreferences(prev => ({ ...prev, enabled: true }));
      await localStorageService.set("notifications_enabled", true);
      presentToast({
        message: "Notifications enabled",
        duration: 2000,
        color: "success",
        icon: checkmarkCircleOutline,
      });
    } else {
      setPermissionStatus("denied");
      presentToast({
        message: "Notification permission denied",
        duration: 2000,
        color: "warning",
      });
    }
  };

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    if (key === "enabled" && value && permissionStatus !== "granted") {
      await handleRequestPermission();
      return;
    }

    setPreferences(prev => ({ ...prev, [key]: value }));
    await localStorageService.set(`notifications_${key}`, value);

    if (key === "enabled") {
      await localStorageService.set("notifications_enabled", value);
    }

    presentToast({
      message: `${key.replace(/([A-Z])/g, " $1").trim()} ${value ? "enabled" : "disabled"}`,
      duration: 1500,
      color: "success",
    });
  };

  const handleTestNotification = async () => {
    if (permissionStatus !== "granted") {
      presentToast({
        message: "Please enable notifications first",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    await notificationService.showNotification({
      title: "Test Notification",
      body: "This is a test notification from Syncstuff",
      icon: "/icons/icon-192x192.png",
    });

    presentToast({
      message: "Test notification sent",
      duration: 2000,
      color: "success",
    });
  };

  return (
    <IonCard className="notification-settings-card">
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={notificationsOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Notifications</IonCardTitle>
            <IonCardSubtitle>
              Configure notification preferences
            </IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="full">
          <IonItem>
            <IonIcon icon={notificationsOutline} slot="start" />
            <IonLabel>
              <h3>Enable Notifications</h3>
              <p>Receive notifications for important events</p>
            </IonLabel>
            <div
              slot="end"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              <IonBadge
                color={
                  permissionStatus === "granted"
                    ? "success"
                    : permissionStatus === "denied"
                      ? "danger"
                      : "warning"
                }
              >
                {permissionStatus === "granted"
                  ? "Granted"
                  : permissionStatus === "denied"
                    ? "Denied"
                    : "Not Set"}
              </IonBadge>
              <IonToggle
                checked={preferences.enabled}
                onIonChange={e => handleToggle("enabled", e.detail.checked)}
                disabled={permissionStatus === "denied"}
              />
            </div>
          </IonItem>

          {permissionStatus !== "granted" && (
            <IonItem>
              <IonButton
                expand="block"
                fill="outline"
                onClick={handleRequestPermission}
                disabled={permissionStatus === "denied"}
              >
                <IonIcon icon={notificationsOutline} slot="start" />
                Request Permission
              </IonButton>
            </IonItem>
          )}

          {preferences.enabled && permissionStatus === "granted" && (
            <>
              <IonItem>
                <IonIcon icon={swapHorizontalOutline} slot="start" />
                <IonLabel>
                  <h3>Sync Notifications</h3>
                  <p>Notify when sync operations complete</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.syncNotifications}
                  onIonChange={e =>
                    handleToggle("syncNotifications", e.detail.checked)
                  }
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={cloudOutline} slot="start" />
                <IonLabel>
                  <h3>Cloud Account Notifications</h3>
                  <p>Notify when cloud accounts connect or disconnect</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.cloudNotifications}
                  onIonChange={e =>
                    handleToggle("cloudNotifications", e.detail.checked)
                  }
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={swapHorizontalOutline} slot="start" />
                <IonLabel>
                  <h3>Transfer Notifications</h3>
                  <p>Notify when file transfers start or complete</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.transferNotifications}
                  onIonChange={e =>
                    handleToggle("transferNotifications", e.detail.checked)
                  }
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={phonePortraitOutline} slot="start" />
                <IonLabel>
                  <h3>Device Notifications</h3>
                  <p>Notify when devices connect or disconnect</p>
                </IonLabel>
                <IonToggle
                  checked={preferences.deviceNotifications}
                  onIonChange={e =>
                    handleToggle("deviceNotifications", e.detail.checked)
                  }
                />
              </IonItem>

              <IonItem>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleTestNotification}
                >
                  <IonIcon icon={notificationsOutline} slot="start" />
                  Send Test Notification
                </IonButton>
              </IonItem>
            </>
          )}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
