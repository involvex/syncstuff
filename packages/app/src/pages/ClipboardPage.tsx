import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonToggle,
  IonText,
  IonIcon,
  IonButton,
  IonBadge,
} from "@ionic/react";
import { useState, useEffect } from "react";
import {
  playCircleOutline,
  pauseCircleOutline,
  warningOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import { ClipboardList } from "../components/clipboard/ClipboardList";
import { ClipboardSyncModal } from "../components/clipboard/ClipboardSyncModal";
import { useClipboard } from "../hooks/useClipboard";
import { useSettingsStore } from "../store/settings.store";
import { localStorageService } from "../services/storage/local-storage.service";
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
          <div className="clipboard-history-container">
            <div className="clipboard-status-bar">
              <div className="status-info">
                <div
                  className={`p-2 rounded-xl ${isMonitoring ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  <IonIcon
                    icon={isMonitoring ? playCircleOutline : pauseCircleOutline}
                    className={
                      isMonitoring
                        ? "status-icon-active"
                        : "status-icon-inactive"
                    }
                  />
                </div>
                <IonText>
                  <p className="status-text text-gray-900 dark:text-white">
                    {isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
                  </p>
                </IonText>
              </div>
              <IonButton
                fill="solid"
                onClick={handleToggleMonitoring}
                color={isMonitoring ? "danger" : "primary"}
                className="rounded-xl overflow-hidden font-bold"
              >
                {isMonitoring ? "Pause" : "Resume"}
              </IonButton>
            </div>

            <ClipboardList />
          </div>
        )}

        {selectedSegment === "settings" && (
          <div className="clipboard-settings-container">
            <IonList lines="full" className="ion-no-margin">
              <IonItem className="rounded-xl overflow-hidden mx-4 my-2">
                <IonLabel className="py-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Auto-sync clipboard
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically sync clipboard to paired devices
                  </p>
                </IonLabel>
                <IonToggle
                  checked={clipboardAutoSync}
                  onIonChange={e => handleAutoSyncToggle(e.detail.checked)}
                />
              </IonItem>

              {!clipboardAutoSync && (
                <div className="privacy-warning p-4 mx-4 my-2 rounded-2xl flex items-start gap-3">
                  <IonIcon
                    icon={warningOutline}
                    color="warning"
                    className="text-xl"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-relaxed">
                      Auto-sync is disabled for privacy. Each sync operation
                      will require manual approval.
                    </p>
                  </div>
                </div>
              )}

              <IonItem className="rounded-xl overflow-hidden mx-4 my-2">
                <IonLabel className="py-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Sync images
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Include images in clipboard synchronization
                  </p>
                </IonLabel>
                <IonToggle
                  checked={clipboardSyncImages}
                  onIonChange={e => handleSyncImagesToggle(e.detail.checked)}
                  disabled={!clipboardAutoSync}
                />
              </IonItem>

              <IonItem className="rounded-xl overflow-hidden mx-4 my-2">
                <IonLabel className="py-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Show content preview
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display preview of clipboard content in history
                  </p>
                </IonLabel>
                <IonToggle
                  checked={clipboardShowPreview}
                  onIonChange={e => handleShowPreviewToggle(e.detail.checked)}
                />
              </IonItem>

              <IonItem className="rounded-xl overflow-hidden mx-4 my-2 border border-blue-100 dark:border-blue-900/50">
                <IonIcon
                  icon={cloudUploadOutline}
                  slot="start"
                  color="primary"
                />
                <IonLabel className="py-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Backup to Cloud
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Save clipboard history to connected accounts
                  </p>
                </IonLabel>
                <IonToggle
                  checked={clipboardCloudBackup}
                  onIonChange={e => handleCloudBackupToggle(e.detail.checked)}
                />
              </IonItem>
            </IonList>

            <div className="settings-info-section">
              <IonText>
                <h3>Security & Privacy</h3>
                <p>
                  Clipboard sync uses military-grade encryption to share text
                  and images directly between your paired devices in real-time.
                </p>
                <p>
                  Enable auto-sync for a seamless experience, or keep it
                  disabled to maintain control over exactly what leaves this
                  device.
                </p>
                <p className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <strong className="text-blue-600 dark:text-blue-400">
                    P2P Architecture:
                  </strong>{" "}
                  Your data never touches our servers. Every sync is a direct,
                  encrypted handshake between your owned nodes.
                </p>
              </IonText>
            </div>
          </div>
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
