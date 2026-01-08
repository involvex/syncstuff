import React from "react";
import { IonText } from "@ionic/react";
import { DeviceCard } from "./DeviceCard";
import type { Device } from "../../types/device.types";
import type { DiscoveredDevice } from "../../types/network.types";
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
            key={device.id}
            device={device}
            isPaired={isPaired}
            onPair={onPair ? () => onPair(device) : undefined}
            onUnpair={onUnpair ? () => onUnpair(device.id) : undefined}
            onConnect={onConnect ? () => onConnect(device.id) : undefined}
            onSendFile={onSendFile}
            onPing={onPing}
            onRing={onRing}
          />
        );
      })}
    </div>
  );
};
