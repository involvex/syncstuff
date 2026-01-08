import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonText,
  IonFooter,
  IonNote,
} from "@ionic/react";
import {
  cameraOutline,
  notificationsOutline,
  folderOutline,
  clipboardOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import {
  permissionsService,
  PermissionsState,
} from "../../services/permissions/permissions.service";
import "./PermissionRequestModal.css";

interface PermissionRequestModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  requiredPermissions?: Array<keyof PermissionsState>;
}

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
  isOpen,
  onDismiss,
  requiredPermissions = ["camera", "notifications", "storage", "clipboard"],
}) => {
  const [permissions, setPermissions] = useState<PermissionsState | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    const state = await permissionsService.getPermissionsState();
    setPermissions(state);
  };

  const handleRequest = async (type: keyof PermissionsState) => {
    let success = false;
    if (type === "camera") {
      success = await permissionsService.requestCameraPermission();
    } else if (type === "notifications") {
      success = await permissionsService.requestNotificationPermission();
    } else if (type === "storage") {
      success = await permissionsService.requestStoragePermission();
    } else if (type === "location") {
      success = await permissionsService.requestLocationPermission();
    }

    if (success) {
      await loadPermissions();
    }
  };

  const getPermissionInfo = (type: keyof PermissionsState) => {
    switch (type) {
      case "camera":
        return {
          label: "Camera",
          description: "Used to scan QR codes for pairing devices.",
          icon: cameraOutline,
        };
      case "notifications":
        return {
          label: "Notifications",
          description:
            "Required to keep you updated on file transfers and sync status.",
          icon: notificationsOutline,
        };
      case "storage":
        return {
          label: "Storage",
          description:
            "Required to save and access files for cross-device sharing.",
          icon: folderOutline,
        };
      case "clipboard":
        return {
          label: "Clipboard",
          description:
            "Used to sync your clipboard across all your devices automatically.",
          icon: clipboardOutline,
        };
      default:
        return {
          label: type,
          description: "Permission required for app features.",
          icon: shieldCheckmarkOutline,
        };
    }
  };

  const allGranted = requiredPermissions.every(
    key => permissions?.[key]?.granted,
  );

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      className="permission-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>App Permissions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="permission-intro">
          <div className="permission-icon-header">
            <IonIcon icon={shieldCheckmarkOutline} />
          </div>
          <h2>Access Required</h2>
          <p>
            To provide a seamless synchronization experience, SyncStuff needs
            access to a few features on your device.
          </p>
        </div>

        <IonList lines="none">
          {requiredPermissions.map(type => {
            const info = getPermissionInfo(type);
            const status = permissions?.[type];
            const isGranted = status?.granted;

            return (
              <IonItem key={type} className="permission-item">
                <div className="permission-item-content">
                  <div className="permission-item-left">
                    <div
                      className={`permission-icon-box ${isGranted ? "granted" : ""}`}
                    >
                      <IonIcon icon={info.icon} />
                    </div>
                  </div>
                  <div className="permission-item-details">
                    <IonLabel>
                      <h3>{info.label}</h3>
                      <p>{info.description}</p>
                    </IonLabel>
                  </div>
                  <div slot="end">
                    {isGranted ? (
                      <IonText color="success" className="granted-text">
                        Granted
                      </IonText>
                    ) : (
                      <IonButton
                        size="small"
                        fill="solid"
                        onClick={() => handleRequest(type)}
                      >
                        Allow
                      </IonButton>
                    )}
                  </div>
                </div>
              </IonItem>
            );
          })}
        </IonList>

        <div className="permission-footer-note">
          <IonNote>
            You can always manage these permissions in the app settings or your
            system settings.
          </IonNote>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton
            expand="block"
            onClick={onDismiss}
            fill={allGranted ? "solid" : "outline"}
            color={allGranted ? "success" : "primary"}
          >
            {allGranted ? "Continue to App" : "Later"}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};
