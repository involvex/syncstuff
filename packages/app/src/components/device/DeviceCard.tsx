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
  batteryFull,
  batteryCharging,
  notifications,
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
  onPing?: (deviceId: string) => void;
  onRing?: (deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isPaired,
  onPair,
  onUnpair,
  onConnect,
  onSendFile,
  onPing,
  onRing,
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

  const getBatteryIcon = () => {
    if (!device.battery) return null;
    return device.battery.charging ? batteryCharging : batteryFull;
  };

  const getBatteryColor = () => {
    if (!device.battery) return "medium";
    if (device.battery.level > 0.6) return "success";
    if (device.battery.level > 0.2) return "warning";
    return "danger";
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
            {device.battery && (
              <IonBadge color={getBatteryColor()}>
                <IonIcon icon={getBatteryIcon() || batteryFull} />
                {Math.round(device.battery.level * 100)}%
              </IonBadge>
            )}
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
            {isPaired && onPing && (
              <IonButton
                fill="outline"
                onClick={() => onPing(device.id)}
                className="ping-button"
              >
                Ping
              </IonButton>
            )}
            {isPaired && onRing && (
              <IonButton
                fill="outline"
                onClick={() => onRing(device.id)}
                className="ring-button"
              >
                <IonIcon slot="icon-only" icon={notifications} />
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
