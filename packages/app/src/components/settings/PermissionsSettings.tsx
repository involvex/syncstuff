import React, { useState, useEffect, useCallback } from "react";
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
  IonText,
  IonBadge,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  cameraOutline,
  clipboardOutline,
  notificationsOutline,
  folderOutline,
  locationOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import {
  permissionsService,
  type PermissionsState,
} from "../../services/permissions/permissions.service";

export const PermissionsSettings: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionsState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [presentToast] = useIonToast();

  const loadPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const state = await permissionsService.getPermissionsState();
      setPermissions(state);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      presentToast({
        message: "Failed to load permissions",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [presentToast]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const state = await permissionsService.refresh();
      setPermissions(state);
      presentToast({
        message: "Permissions refreshed",
        duration: 2000,
        color: "success",
        icon: refreshOutline,
      });
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      presentToast({
        message: "Failed to refresh permissions",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestPermission = async (
    permissionType: keyof PermissionsState,
  ) => {
    try {
      let granted = false;

      switch (permissionType) {
        case "notifications":
          granted = await permissionsService.requestNotificationPermission();
          break;
        case "location":
          if (permissions?.location) {
            granted = await permissionsService.requestLocationPermission();
          }
          break;
        case "camera":
          granted = await permissionsService.requestCameraPermission();
          break;
        default:
          presentToast({
            message: "Permission request not available for this type",
            duration: 2000,
            color: "warning",
          });
          return;
      }

      if (granted) {
        presentToast({
          message: `${permissionType} permission granted`,
          duration: 2000,
          color: "success",
          icon: checkmarkCircleOutline,
        });
        await loadPermissions();
      } else {
        presentToast({
          message: `${permissionType} permission denied`,
          duration: 2000,
          color: "warning",
        });
      }
    } catch (error) {
      console.error(`Failed to request ${permissionType} permission:`, error);
      presentToast({
        message: `Failed to request ${permissionType} permission`,
        duration: 2000,
        color: "danger",
      });
    }
  };

  const getPermissionIcon = (permissionType: keyof PermissionsState) => {
    switch (permissionType) {
      case "camera":
        return cameraOutline;
      case "clipboard":
        return clipboardOutline;
      case "notifications":
        return notificationsOutline;
      case "storage":
        return folderOutline;
      case "location":
        return locationOutline;
      default:
        return shieldCheckmarkOutline;
    }
  };

  const getPermissionStatus = (status: {
    granted: boolean;
    denied: boolean;
    prompt: boolean;
  }) => {
    if (status.granted) {
      return {
        text: "Granted",
        color: "success" as const,
        icon: checkmarkCircleOutline,
      };
    }
    if (status.denied) {
      return {
        text: "Denied",
        color: "danger" as const,
        icon: closeCircleOutline,
      };
    }
    return { text: "Not Set", color: "warning" as const, icon: refreshOutline };
  };

  if (isLoading) {
    return (
      <IonCard>
        <IonCardContent>
          <div className="flex items-center justify-center py-8">
            <IonSpinner name="crescent" />
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  if (!permissions) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="danger">
            <p>Failed to load permissions</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  // Get permission keys in a safe way
  const permissionKeys = Object.keys(permissions).filter(
    key => permissions[key as keyof PermissionsState] !== undefined,
  ) as Array<keyof PermissionsState>;

  return (
    <IonCard className="permissions-card">
      <IonCardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IonIcon
            icon={shieldCheckmarkOutline}
            style={{ fontSize: "28px", color: "var(--ion-color-primary)" }}
          />
          <div>
            <IonCardTitle>Permissions</IonCardTitle>
            <IonCardSubtitle>Manage app permissions and access</IonCardSubtitle>
          </div>
          <IonButton
            fill="clear"
            size="small"
            onClick={handleRefresh}
            disabled={Boolean(isRefreshing)}
            slot="end"
          >
            {isRefreshing ? (
              <IonSpinner name="crescent" />
            ) : (
              <IonIcon icon={refreshOutline} />
            )}
          </IonButton>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="full">
          {permissionKeys.length > 0 ? (
            permissionKeys.map(permissionType => {
              const permission = permissions[permissionType];
              if (!permission) return null;

              const status = getPermissionStatus(permission);
              const canRequest =
                !permission.granted &&
                (permissionType === "notifications" ||
                  permissionType === "location" ||
                  permissionType === "camera");

              return (
                <IonItem key={permissionType}>
                  <IonIcon
                    icon={getPermissionIcon(permissionType)}
                    slot="start"
                    style={{ fontSize: "24px" }}
                  />
                  <IonLabel>
                    <h3 style={{ textTransform: "capitalize" }}>
                      {permissionType.replace(/_/g, " ")}
                    </h3>
                    <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>
                      {permissionType === "camera" &&
                        "Required for QR code scanning"}
                      {permissionType === "clipboard" &&
                        "Required for clipboard sync"}
                      {permissionType === "notifications" &&
                        "Required for sync notifications"}
                      {permissionType === "storage" &&
                        "Required for file storage"}
                      {permissionType === "network" &&
                        "Required for device communication"}
                      {permissionType === "location" &&
                        "Optional for location-based features"}
                    </p>
                  </IonLabel>
                  <div
                    slot="end"
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <IonBadge color={status.color}>{status.text}</IonBadge>
                    {canRequest && (
                      <IonButton
                        fill="outline"
                        size="small"
                        onClick={() => handleRequestPermission(permissionType)}
                      >
                        Request
                      </IonButton>
                    )}
                  </div>
                </IonItem>
              );
            })
          ) : (
            <IonItem>
              <IonLabel>
                <p>No permissions available</p>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
