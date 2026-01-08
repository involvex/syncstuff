import React, { useRef } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
} from "@ionic/react";
import {
  laptop,
  desktop,
  logoAndroid,
  logoApple,
  globe,
  checkmarkCircle,
  wifi,
  closeCircle,
  documentAttach,
} from "ionicons/icons";
import type { Device } from "../../types/device.types";
import "./DeviceCard.css";

interface DeviceCardProps {
  device: Device;
  isPaired: boolean;
  onPair?: (device: Device) => void;
  onUnpair?: (deviceId: string) => void;
  onConnect?: (deviceId: string) => void;
  onSendFile?: (file: File, deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isPaired,
  onPair,
  onUnpair,
  onConnect,
  onSendFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlatformIcon = () => {
    switch (device.platform) {
      case "android":
        return logoAndroid;
      case "ios":
        return logoApple;
      case "web":
        return globe;
      case "desktop":
        return desktop;
      default:
        return laptop;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      onSendFile(file, device.id);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <IonCard className="device-card">
        <IonCardHeader>
          <div className="device-card-header">
            <div className="device-icon-container">
              <IonIcon icon={getPlatformIcon()} size="large" />
            </div>
            <div className="device-card-titles">
              <IonCardTitle>{device.name}</IonCardTitle>
              <IonCardSubtitle>{device.id}</IonCardSubtitle>
            </div>
          </div>
        </IonCardHeader>
        <IonCardContent>
          <div className="status-row">
            {isPaired ? (
              <IonBadge color="success">
                <IonIcon icon={checkmarkCircle} />
                Paired
              </IonBadge>
            ) : (
              <IonBadge color="medium">Discovered</IonBadge>
            )}
            <IonBadge color="primary">
              <IonIcon icon={wifi} />
              {device.status}
            </IonBadge>
          </div>

          <div className="action-buttons">
            {!isPaired && onPair && (
              <IonButton
                fill="solid"
                onClick={() => onPair(device)}
                className="connect-button"
              >
                Pair Device
              </IonButton>
            )}
            {isPaired && onConnect && (
              <IonButton
                fill="solid"
                onClick={() => onConnect(device.id)}
                className="connect-button"
              >
                Connect
              </IonButton>
            )}
            {isPaired && onSendFile && (
              <IonButton
                fill="outline"
                onClick={triggerFileSelect}
                className="send-button"
              >
                <IonIcon slot="start" icon={documentAttach} />
                Send File
              </IonButton>
            )}
            {isPaired && onUnpair && (
              <IonButton
                color="danger"
                fill="clear"
                onClick={() => onUnpair(device.id)}
                className="unpair-button"
              >
                <IonIcon slot="icon-only" icon={closeCircle} />
              </IonButton>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    </>
  );
};
