import React, { useState } from "react";
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
  IonSegment,
  IonSegmentButton,
  IonIcon,
} from "@ionic/react";
import { cloudOutline, playForwardOutline } from "ionicons/icons";
import { useTransfer } from "../hooks/useTransfer";
import { TransferItem } from "../components/transfer/TransferItem";
import { FileSelector } from "../components/transfer/FileSelector";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery"; // To get paired devices
import { CloudFileBrowser } from "../components/cloud/CloudFileBrowser";
import { useCloudStore } from "../store/cloud.store";
import "./TransfersPage.css";

const TransfersPage: React.FC = () => {
  const [segment, setSegment] = useState<"local" | "cloud">("local");
  const { activeTransfers, transferHistory, sendFile } = useTransfer();
  const { pairedDevices } = useDeviceDiscovery();
  const { accounts } = useCloudStore();

  const handleFileSelect = (file: File) => {
    // For MVP, we auto-select the first paired device
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
          <IonTitle>Transfers</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={segment}
            onIonChange={e => setSegment(e.detail.value as "local" | "cloud")}
          >
            <IonSegmentButton value="local">
              <IonIcon icon={playForwardOutline} />
              <IonLabel>Local</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="cloud">
              <IonIcon icon={cloudOutline} />
              <IonLabel>Cloud</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="transfers-container">
          {segment === "local" ? (
            <>
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
            </>
          ) : (
            <>
              {accounts.length > 0 ? (
                accounts.map(account => (
                  <div key={account.id}>
                    <IonListHeader>
                      <IonLabel>
                        {account.name} ({account.provider})
                      </IonLabel>
                    </IonListHeader>
                    <CloudFileBrowser account={account} />
                  </div>
                ))
              ) : (
                <IonCard>
                  <IonCardContent className="ion-text-center">
                    <IonIcon
                      icon={cloudOutline}
                      style={{
                        fontSize: "64px",
                        marginBottom: "16px",
                        color: "var(--ion-color-medium)",
                      }}
                    />
                    <p>No cloud accounts linked.</p>
                    <IonText color="medium">
                      <p>Go to Settings to connect Google Drive or Mega.</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransfersPage;
