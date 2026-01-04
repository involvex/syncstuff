import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonLabel,
  IonCard,
  IonCardContent,
  IonText,
} from "@ionic/react";
import { useTransfer } from "../hooks/useTransfer";
import { TransferItem } from "../components/transfer/TransferItem";
import { FileSelector } from "../components/transfer/FileSelector";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery"; // To get paired devices
import "./TransfersPage.css";

const TransfersPage: React.FC = () => {
  const { activeTransfers, transferHistory, sendFile } = useTransfer();
  const { pairedDevices } = useDeviceDiscovery();

  const handleFileSelect = (file: File) => {
    // For MVP, we auto-select the first paired device or current device for testing if none paired
    // Ideally we should prompt user to select a device
    const deviceId = pairedDevices[0]?.id;

    if (deviceId) {
      sendFile(file, deviceId);
    } else {
      alert("No device selected. Please pair with a device first.");
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle size="large">Transfers</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transfers</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="transfers-container">
          {pairedDevices.length > 0 ? (
            <IonCard>
              <IonCardContent>
                <IonText>
                  <p>Send file to: {pairedDevices[0].name}</p>
                </IonText>
                <FileSelector onFileSelect={handleFileSelect} />
              </IonCardContent>
            </IonCard>
          ) : (
            <IonCard>
              <IonCardContent>
                <p>No paired devices found. Go to Devices tab to pair.</p>
              </IonCardContent>
            </IonCard>
          )}

          {activeTransfers.length > 0 && (
            <IonList>
              <IonListHeader>
                <IonLabel>Active</IonLabel>
              </IonListHeader>
              {activeTransfers.map(transfer => (
                <TransferItem key={transfer.id} transfer={transfer} />
              ))}
            </IonList>
          )}

          {transferHistory.length > 0 && (
            <IonList>
              <IonListHeader>
                <IonLabel>History</IonLabel>
              </IonListHeader>
              {transferHistory.map(transfer => (
                <TransferItem key={transfer.id} transfer={transfer} />
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransfersPage;
