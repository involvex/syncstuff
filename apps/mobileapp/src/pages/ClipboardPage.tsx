import {
  IonBadge,
  IonContent,
  IonHeader,
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
  Separator,
  StatusBadge,
  Switch,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import { useEffect, useState } from "react";
import { ClipboardList } from "../components/clipboard/ClipboardList";
import { ClipboardSyncModal } from "../components/clipboard/ClipboardSyncModal";
import { useClipboard } from "../hooks/useClipboard";
import { localStorageService } from "../services/storage/local-storage.service";
import { useSettingsStore } from "../store/settings.store";
import { STORAGE_KEYS } from "../types/storage.types";
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
            <IonBadge color="danger" slot="end">
              {pendingApproval.length}
            </IonBadge>
          )}
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            onIonChange={e =>
              setSelectedSegment(e.detail.value as "history" | "settings")
            }
            value={selectedSegment}
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
            <Card bordered elevate padding="$4">
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" space="$3">
                  <View
                    backgroundColor={
                      isMonitoring ? "$green4" : "$backgroundFocus"
                    }
                    borderRadius="$3"
                    padding="$4"
                  >
                    <Text fontSize="$5">{isMonitoring ? "▶️" : "⏹️"}</Text>
                  </View>
                  <YStack>
                    <Text fontWeight="bold">
                      {isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
                    </Text>
                    <Text color="$colorSubtitle" fontSize="        ">
                      Detects clipboard changes
                    </Text>
                  </YStack>
                </XStack>
                <Button
                  onPress={handleToggleMonitoring}
                  size="$3"
                  theme={isMonitoring ? "red" : "blue"}
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
            <Card bordered elevate padding="$4">
              <YStack separator={<Separator />}>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Auto-sync clipboard</Text>
                    <Text color="$colorSubtitle" fontSize="        ">
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
                    backgroundColor="$yellow2"
                    borderRadius="$3"
                    marginVertical="$2"
                    padding="$4"
                  >
                    <Text color="$yellow10" fontSize="        ">
                      Auto-sync is disabled for privacy. Each sync will require
                      manual approval.
                    </Text>
                  </YStack>
                )}

                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  opacity={!clipboardAutoSync ? 0.5 : 1}
                  padding="$4"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Sync images</Text>
                    <Text color="$colorSubtitle" fontSize="        ">
                      Include images in sync
                    </Text>
                  </YStack>
                  <Switch
                    checked={clipboardSyncImages}
                    disabled={!clipboardAutoSync}
                    onCheckedChange={handleSyncImagesToggle}
                  >
                    <Switch.Thumb animation="quick" />
                  </Switch>
                </XStack>

                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Show content preview</Text>
                    <Text color="$colorSubtitle" fontSize="        ">
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
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                >
                  <YStack flex={1} space="        ">
                    <Text fontWeight="bold">Backup to Cloud</Text>
                    <Text color="$colorSubtitle" fontSize="        ">
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

            <Card backgroundColor="$backgroundFocus" bordered padding="$4">
              <YStack space="$2">
                <Text fontWeight="bold">Security & Privacy</Text>
                <Text color="$colorSubtitle" fontSize="$2">
                  Clipboard sync uses military-grade encryption to share text
                  and images directly between your paired devices in real-time.
                </Text>
                <Separator marginVertical="$2" />
                <XStack alignItems="center" space="$2">
                  <StatusBadge status="info">P2P ARCHITECTURE</StatusBadge>
                  <Text color="$colorSubtitle" flex={1} fontSize="        ">
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
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          sync={currentPendingSync}
        />
      </IonContent>
    </IonPage>
  );
};

export default ClipboardPage;
