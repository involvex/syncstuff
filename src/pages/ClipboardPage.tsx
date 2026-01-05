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
                <IonIcon
                  icon={isMonitoring ? playCircleOutline : pauseCircleOutline}
                  className={
                    isMonitoring ? "status-icon-active" : "status-icon-inactive"
                  }
                />
                <IonText>
                  <p className="status-text">
                    {isMonitoring
                      ? "Monitoring clipboard"
                      : "Monitoring paused"}
                  </p>
                </IonText>
              </div>
              <IonButton
                fill="outline"
                size="small"
                onClick={handleToggleMonitoring}
                color={isMonitoring ? "danger" : "primary"}
              >
                {isMonitoring ? "Stop" : "Start"}
              </IonButton>
            </div>

            <ClipboardList />
          </div>
        )}

        {selectedSegment === "settings" && (
          <div className="clipboard-settings-container">
            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Auto-sync clipboard</h2>
                  <p>Automatically sync clipboard to paired devices</p>
                </IonLabel>
                <IonToggle
                  checked={clipboardAutoSync}
                  onIonChange={e => handleAutoSyncToggle(e.detail.checked)}
                />
              </IonItem>

              {!clipboardAutoSync && (
                <IonItem lines="none" className="privacy-warning">
                  <IonIcon icon={warningOutline} slot="start" color="warning" />
                  <IonLabel className="ion-text-wrap">
                    <p>
                      Auto-sync is disabled for privacy. You'll need to approve
                      each clipboard sync manually.
                    </p>
                  </IonLabel>
                </IonItem>
              )}

              <IonItem>
                <IonLabel>
                  <h2>Sync images</h2>
                  <p>Include images in clipboard synchronization</p>
                </IonLabel>
                <IonToggle
                  checked={clipboardSyncImages}
                  onIonChange={e => handleSyncImagesToggle(e.detail.checked)}
                  disabled={!clipboardAutoSync}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>Show content preview</h2>
                  <p>Display preview of clipboard content in history</p>
                </IonLabel>
                <IonToggle
                  checked={clipboardShowPreview}
                  onIonChange={e => handleShowPreviewToggle(e.detail.checked)}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>Backup to Cloud</h2>
                  <p>Save clipboard history to connected cloud accounts</p>
                </IonLabel>
                <IonIcon icon={cloudUploadOutline} slot="start" />
                <IonToggle
                  checked={clipboardCloudBackup}
                  onIonChange={e => handleCloudBackupToggle(e.detail.checked)}
                />
              </IonItem>
            </IonList>

            <div className="settings-info-section">
              <IonText>
                <h3>About Clipboard Sync</h3>
                <p>
                  Clipboard sync allows you to share text and images between
                  your paired devices in real-time. When enabled, any content
                  you copy will automatically sync to all connected devices.
                </p>
                <p>
                  For privacy, auto-sync is disabled by default. Enable it in
                  settings to sync automatically, or keep it disabled to approve
                  each sync manually.
                </p>
                <p>
                  <strong>Privacy Note:</strong> Clipboard content is sent
                  directly between devices using encrypted peer-to-peer
                  connections. No data is stored on servers.
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
