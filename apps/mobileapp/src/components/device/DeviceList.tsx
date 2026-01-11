import { IonText } from "@ionic/react";
import type React from "react";
import type { Device } from "../../types/device.types";
import type { DiscoveredDevice } from "../../types/network.types";
import { DeviceCard } from "./DeviceCard";
import "./DeviceList.css";

interface DeviceListProps {
  devices: (Device | DiscoveredDevice)[];
  pairedDeviceIds: string[];
  onPair?: (device: Device) => void;
  onUnpair?: (deviceId: string) => void;
  onConnect?: (deviceId: string) => void;
  onSendFile?: (file: File, deviceId: string) => void;
  onPing?: (deviceId: string) => void;
  onRing?: (deviceId: string) => void;
  emptyMessage?: string;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  pairedDeviceIds,
  onPair,
  onUnpair,
  onConnect,
  onSendFile,
  onPing,
  onRing,
  emptyMessage = "No devices found",
}) => {
  if (devices.length === 0) {
    return (
      <div className="device-list-empty">
        <IonText color="medium">
          <p>{emptyMessage}</p>
        </IonText>
      </div>
    );
  }

  return (
    <div className="device-list">
      {devices.map(device => {
        const isPaired = pairedDeviceIds.includes(device.id);

        return (
          <DeviceCard
            device={device}
            isPaired={isPaired}
            key={device.id}
            onConnect={onConnect ? () => onConnect(device.id) : undefined}
            onPair={onPair ? () => onPair(device) : undefined}
            onPing={onPing}
            onRing={onRing}
            onSendFile={onSendFile}
            onUnpair={onUnpair ? () => onUnpair(device.id) : undefined}
          />
        );
      })}
    </div>
  );
};
