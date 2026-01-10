import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { ClipboardList } from "../components/clipboard/ClipboardList";
import { ClipboardSyncModal } from "../components/clipboard/ClipboardSyncModal";
import { useClipboard } from "../hooks/useClipboard";
import { useSettingsStore } from "../store/settings.store";
import { localStorageService } from "../services/storage/local-storage.service";
import { STORAGE_KEYS } from "../types/storage.types";
import {
  Card,
  YStack,
  XStack,
  Text,
  Button,
  Switch,
  View,
  Separator,
  StatusBadge,
} from "@syncstuff/ui";
import "./ClipboardPage.css";

const ClipboardPage: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<
    "history" | "settings"
  >("history");
  const { pendingApproval, isMonitoring, startMonitoring, stopMonitoring } =
    useClipboard();

  const {
    clipboardAutoSync,
    clipboardSyncImages,
    clipboardShowPreview,
    clipboardCloudBackup,
    setClipboardAutoSync,
    setClipboardSyncImages,
    setClipboardShowPreview,
    setClipboardCloudBackup,
  } = useSettingsStore();

  // Show modal for first pending approval
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const currentPendingSync =
    pendingApproval.length > 0 ? pendingApproval[0] : null;

  useEffect(() => {
    if (currentPendingSync && !showApprovalModal) {
      setShowApprovalModal(true);
    }
  }, [currentPendingSync, showApprovalModal]);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const handleAutoSyncToggle = async (enabled: boolean) => {
    setClipboardAutoSync(enabled);
    await localStorageService.set(STORAGE_KEYS.CLIPBOARD_AUTO_SYNC, enabled);

    // Start/stop monitoring based on auto-sync setting
    if (enabled && !isMonitoring) {
      startMonitoring();
    } else if (!enabled && isMonitoring) {
      stopMonitoring();
    }
  };

  const handleSyncImagesToggle = async (enabled: boolean) => {
    setClipboardSyncImages(enabled);
    await localStorageService.set(STORAGE_KEYS.CLIPBOARD_SYNC_IMAGES, enabled);
  };

  const handleShowPreviewToggle = async (enabled: boolean) => {
    setClipboardShowPreview(enabled);
    await localStorageService.set(STORAGE_KEYS.CLIPBOARD_SHOW_PREVIEW, enabled);
  };

  const handleCloudBackupToggle = async (enabled: boolean) => {
    setClipboardCloudBackup(enabled);
    await localStorageService.set("clipboardCloudBackup", enabled);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clipboard</IonTitle>
          {pendingApproval.length > 0 && (
            <IonBadge slot="end" color="danger">
              {pendingApproval.length}
            </IonBadge>
          )}
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            value={selectedSegment}
            onIonChange={e =>
              setSelectedSegment(e.detail.value as "history" | "settings")
            }
          >
            <IonSegmentButton value="history">
              <IonLabel>History</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="settings">
              <IonLabel>Settings</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {selectedSegment === "history" && (
          <YStack padding="$4" space="$4">
            <Card elevate bordered padding="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack space="$3" alignItems="center">
                  <View
                    backgroundColor={
                      isMonitoring ? "$green4" : "$backgroundFocus"
                    }
                    padding="$4"
                    borderRadius="$3"
                  >
                    <Text fontSize="$5">{isMonitoring ? "▶️" : "⏹️"}</Text>
                  </View>
                  <YStack>
                    <Text fontWeight="bold">
                      {isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
                    </Text>
                    <Text fontSize="        " color="$colorSubtitle">
                      Detects clipboard changes
                    </Text>
                  </YStack>
                </XStack>
                <Button
                  theme={isMonitoring ? "red" : "blue"}
                  size="$3"
                  onPress={handleToggleMonitoring}
                >
                  {isMonitoring ? "Pause" : "Resume"}
                </Button>
              </XStack>
            </Card>

            <ClipboardList />
          </YStack>
        )}

        {selectedSegment === "settings" && (
          <YStack padding="$4" space="$4">
            <Card elevate bordered padding="$4">
              <YStack separator={<Separator />}>
                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Auto-sync clipboard</Text>
                    <Text fontSize="        " color="$colorSubtitle">
                      Automatically sync to paired devices
                    </Text>
                  </YStack>
                  <Switch
                    checked={clipboardAutoSync}
                    onCheckedChange={handleAutoSyncToggle}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>

                {!clipboardAutoSync && (
                  <YStack
                    padding="$4"
                    backgroundColor="$yellow2"
                    borderRadius="$3"
                    marginVertical="$2"
                  >
                    <Text fontSize="        " color="$yellow10">
                      Auto-sync is disabled for privacy. Each sync will require
                      manual approval.
                    </Text>
                  </YStack>
                )}

                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                  opacity={!clipboardAutoSync ? 0.5 : 1}
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Sync images</Text>
                    <Text fontSize="        " color="$colorSubtitle">
                      Include images in sync
                    </Text>
                  </YStack>
                  <Switch
                    checked={clipboardSyncImages}
                    onCheckedChange={handleSyncImagesToggle}
                    disabled={!clipboardAutoSync}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>

                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Show content preview</Text>
                    <Text fontSize="        " color="$colorSubtitle">
                      Display preview in history
                    </Text>
                  </YStack>
                  <Switch
                    checked={clipboardShowPreview}
                    onCheckedChange={handleShowPreviewToggle}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>

                <XStack
                  padding="$4"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Backup to Cloud</Text>
                    <Text fontSize="        " color="$colorSubtitle">
                      Save history to connected accounts
                    </Text>
                  </YStack>
                  <Switch
                    checked={clipboardCloudBackup}
                    onCheckedChange={handleCloudBackupToggle}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>
              </YStack>
            </Card>

            <Card bordered padding="$4" backgroundColor="$backgroundFocus">
              <YStack space="$2">
                <Text fontWeight="bold">Security & Privacy</Text>
                <Text fontSize="$2" color="$colorSubtitle">
                  Clipboard sync uses military-grade encryption to share text
                  and images directly between your paired devices in real-time.
                </Text>
                <Separator marginVertical="$2" />
                <XStack space="$2" alignItems="center">
                  <StatusBadge status="info">P2P ARCHITECTURE</StatusBadge>
                  <Text fontSize="        " color="$colorSubtitle" flex={1}>
                    Your data never touches our servers. Every sync is a direct,
                    encrypted handshake.
                  </Text>
                </XStack>
              </YStack>
            </Card>
          </YStack>
        )}

        {/* Approval modal for incoming clipboard syncs */}
        <ClipboardSyncModal
          sync={currentPendingSync}
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ClipboardPage;
