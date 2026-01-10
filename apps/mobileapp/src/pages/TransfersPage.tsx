import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
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
import {
  Card,
  YStack,
  XStack,
  Text,
  Button,
  View,
  StatusBadge,
} from "@syncstuff/ui";
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
            <YStack space="$4" padding="$4">
              {pairedDevices.length > 0 ? (
                <Card elevate bordered padding="$4">
                  <YStack space="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold">Send File</Text>
                      <StatusBadge status="info">
                        TARGET: {pairedDevices[0].name}
                      </StatusBadge>
                    </XStack>
                    <FileSelector onFileSelect={handleFileSelect} />
                  </YStack>
                </Card>
              ) : (
                <Card bordered padding="$4" backgroundColor="$backgroundFocus">
                  <YStack space="$2" alignItems="center">
                    <Text textAlign="center">No paired devices found.</Text>
                    <Text
                      fontSize="$2"
                      color="$colorSubtitle"
                      textAlign="center"
                    >
                      Go to Devices tab to pair with another device.
                    </Text>
                  </YStack>
                </Card>
              )}

              {activeTransfers.length > 0 && (
                <YStack space="$2">
                  <Text fontSize="$3" fontWeight="bold" paddingHorizontal="$2">
                    Active
                  </Text>
                  {activeTransfers.map(transfer => (
                    <TransferItem key={transfer.id} transfer={transfer} />
                  ))}
                </YStack>
              )}

              {transferHistory.length > 0 && (
                <YStack space="$2">
                  <Text fontSize="$3" fontWeight="bold" paddingHorizontal="$2">
                    History
                  </Text>
                  {transferHistory.map(transfer => (
                    <TransferItem key={transfer.id} transfer={transfer} />
                  ))}
                </YStack>
              )}
            </YStack>
          ) : (
            <YStack space="$4" padding="$4">
              {accounts.length > 0 ? (
                accounts.map(account => (
                  <YStack key={account.id} space="$2">
                    <XStack padding="$4" space="$2" alignItems="center">
                      <Text fontSize="$5">☁️</Text>
                      <Text fontWeight="bold">{account.name}</Text>
                      <StatusBadge status="info">
                        {account.provider.toUpperCase()}
                      </StatusBadge>
                    </XStack>
                    <CloudFileBrowser account={account} />
                  </YStack>
                ))
              ) : (
                <Card elevate bordered padding="$4">
                  <YStack space="$4" alignItems="center">
                    <View
                      width={80}
                      height={80}
                      borderRadius="$full"
                      backgroundColor="$backgroundFocus"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$9">☁️</Text>
                    </View>
                    <YStack space="$1" alignItems="center">
                      <Text fontSize="$5" fontWeight="bold">
                        No cloud accounts linked
                      </Text>
                      <Text color="$colorSubtitle" textAlign="center">
                        Connect Google Drive or Mega in settings to enable cloud
                        transfers.
                      </Text>
                    </YStack>
                    <Button
                      theme="blue"
                      onPress={() => (window.location.href = "/settings")}
                    >
                      Go to Settings
                    </Button>
                  </YStack>
                </Card>
              )}
            </YStack>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransfersPage;
