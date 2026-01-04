import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonText,
} from "@ionic/react";
import {
  phonePortrait,
  laptop,
  checkmarkCircle,
  linkOutline,
  removeCircleOutline,
} from "ionicons/icons";
import type { Device } from "../../types/device.types";
import "./DeviceCard.css";

interface DeviceCardProps {
  device: Device;
  isPaired: boolean;
  onPair?: () => void;
  onUnpair?: () => void;
  onConnect?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isPaired,
  onPair,
  onUnpair,
  onConnect,
}) => {
  const getPlatformIcon = () => {
    switch (device.platform) {
      case "android":
      case "ios":
        return phonePortrait;
      case "desktop":
      case "web":
        return laptop;
      default:
        return phonePortrait;
    }
  };

  const getStatusColor = () => {
    switch (device.status) {
      case "connected":
        return "success";
      case "paired":
        return "primary";
      case "discovered":
        return "medium";
      case "disconnected":
        return "warning";
      default:
        return "medium";
    }
  };

  const getStatusText = () => {
    if (isPaired) {
      return device.status === "connected" ? "Connected" : "Paired";
    }
    return "Discovered";
  };

  return (
    <IonCard className="device-card">
      <IonCardHeader>
        <div className="device-card-header">
          <IonIcon
            icon={getPlatformIcon()}
            size="large"
            className="device-icon"
          />
          <div className="device-info">
            <IonCardTitle>{device.name}</IonCardTitle>
            <IonCardSubtitle>
              {device.platform.charAt(0).toUpperCase() +
                device.platform.slice(1)}
            </IonCardSubtitle>
          </div>
          <IonBadge color={getStatusColor()} className="device-badge">
            {getStatusText()}
          </IonBadge>
        </div>
      </IonCardHeader>

      <IonCardContent>
        <div className="device-details">
          {device.ipAddress && (
            <IonText color="medium">
              <p className="device-detail">
                <strong>IP:</strong> {device.ipAddress}
              </p>
            </IonText>
          )}
          <IonText color="medium">
            <p className="device-detail">
              <strong>Last seen:</strong> {device.lastSeen.toLocaleTimeString()}
            </p>
          </IonText>
        </div>

        <div className="device-actions">
          {!isPaired && onPair && (
            <IonButton onClick={onPair} size="small" expand="block">
              <IonIcon slot="start" icon={checkmarkCircle} />
              Pair Device
            </IonButton>
          )}

          {isPaired && (
            <>
              {onConnect && device.status !== "connected" && (
                <IonButton
                  onClick={onConnect}
                  size="small"
                  expand="block"
                  color="primary"
                >
                  <IonIcon slot="start" icon={linkOutline} />
                  Connect
                </IonButton>
              )}

              {onUnpair && (
                <IonButton
                  onClick={onUnpair}
                  size="small"
                  expand="block"
                  color="danger"
                  fill="outline"
                >
                  <IonIcon slot="start" icon={removeCircleOutline} />
                  Unpair
                </IonButton>
              )}
            </>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};
