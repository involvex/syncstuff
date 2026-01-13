import {
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  Button,
  Card,
  StatusBadge,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import { cloudOutline, playForwardOutline } from "ionicons/icons";
import type React from "react";
import { useState } from "react";
import { CloudFileBrowser } from "../components/cloud/CloudFileBrowser";
import { FileSelector } from "../components/transfer/FileSelector";
import { TransferItem } from "../components/transfer/TransferItem";
import { useDeviceDiscovery } from "../hooks/useDeviceDiscovery"; // To get paired devices
import { useTransfer } from "../hooks/useTransfer";
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
            onIonChange={e => setSegment(e.detail.value as "local" | "cloud")}
            value={segment}
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
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {pairedDevices.length > 0 ? (
                <Card elevation={2} padding="$4">
                  <YStack space="$3">
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text fontWeight="bold">Send File</Text>
                      <StatusBadge status="info">
                        TARGET: {pairedDevices[0].name}
                      </StatusBadge>
                    </XStack>
                    <FileSelector onFileSelect={handleFileSelect} />
                  </YStack>
                </Card>
              ) : (
                <Card backgroundColor="$backgroundFocus" bordered padding="$4">
                  <YStack alignItems="center" space="$2">
                    <Text textAlign="center">No paired devices found.</Text>
                    <Text
                      color="$colorSubtitle"
                      fontSize="$2"
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
            </div>
          ) : (
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {accounts.length > 0 ? (
                accounts.map(account => (
                  <YStack key={account.id} space="$2">
                    <XStack alignItems="center" padding="$4" space="$2">
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
                <Card bordered elevate padding="$4">
                  <YStack alignItems="center" space="$4">
                    <View
                      alignItems="center"
                      backgroundColor="$backgroundFocus"
                      borderRadius="$full"
                      height={80}
                      justifyContent="center"
                      width={80}
                    >
                      <Text fontSize="$9">☁️</Text>
                    </View>
                    <YStack alignItems="center" space="$1">
                      <Text fontSize="$5" fontWeight="bold">
                        No cloud accounts linked
                      </Text>
                      <Text color="$colorSubtitle" textAlign="center">
                        Connect Google Drive or Mega in settings to enable cloud
                        transfers.
                      </Text>
                    </YStack>
                    <Button
                      onPress={() => (window.location.href = "/settings")}
                      theme="blue"
                    >
                      Go to Settings
                    </Button>
                  </YStack>
                </Card>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TransfersPage;
