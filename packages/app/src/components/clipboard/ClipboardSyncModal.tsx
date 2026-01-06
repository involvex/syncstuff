import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonCheckbox,
} from "@ionic/react";
import {
  closeOutline,
  documentTextOutline,
  imageOutline,
} from "ionicons/icons";
import { useState } from "react";
import type { ClipboardSync } from "../../types/clipboard.types";
import { clipboardSyncService } from "../../services/sync/clipboard-sync.service";
import { useSettingsStore } from "../../store/settings.store";
import "./ClipboardSyncModal.css";

interface ClipboardSyncModalProps {
  sync: ClipboardSync | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClipboardSyncModal: React.FC<ClipboardSyncModalProps> = ({
  sync,
  isOpen,
  onClose,
}) => {
  const [enableAutoSync, setEnableAutoSync] = useState(false);
  const setClipboardAutoSync = useSettingsStore(
    state => state.setClipboardAutoSync,
  );

  if (!sync) return null;

  const handleAccept = () => {
    clipboardSyncService.acceptClipboardSync(sync, sync.deviceId);

    // Update auto-sync setting if checkbox was checked
    if (enableAutoSync) {
      setClipboardAutoSync(true);
    }

    onClose();
  };

  const handleReject = () => {
    clipboardSyncService.rejectClipboardSync(sync, sync.deviceId);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getContentPreview = () => {
    const { content } = sync;

    if (content.type === "text") {
      // Show text preview (first 200 characters)
      const preview = content.content || "[Loading...]";
      return (
        <div className="clipboard-sync-preview-text">
          <IonIcon icon={documentTextOutline} className="preview-icon" />
          <p>
            {preview.substring(0, 200)}
            {preview.length > 200 ? "..." : ""}
          </p>
        </div>
      );
    } else if (content.type === "image") {
      // Show image icon (actual image will be received after acceptance)
      return (
        <div className="clipboard-sync-preview-image">
          <IonIcon icon={imageOutline} className="preview-icon-large" />
          <IonText>
            <p>Image ({content.mimeType || "image/png"})</p>
          </IonText>
        </div>
      );
    }

    return null;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Incoming Clipboard Sync</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="clipboard-sync-modal-content">
        <div className="clipboard-sync-info">
          <IonText>
            <h2>Clipboard content from</h2>
            <p className="device-name">{sync.content.deviceName}</p>
          </IonText>

          <div className="content-info">
            <IonItem lines="none">
              <IonLabel>
                <h3>Content Type</h3>
                <p>{sync.content.type === "image" ? "Image" : "Text"}</p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonLabel>
                <h3>Size</h3>
                <p>{formatSize(sync.totalBytes)}</p>
              </IonLabel>
            </IonItem>
          </div>

          <div className="clipboard-sync-preview">
            <h3>Preview</h3>
            {getContentPreview()}
          </div>

          <IonItem lines="none" className="auto-sync-checkbox">
            <IonCheckbox
              checked={enableAutoSync}
              onIonChange={e => setEnableAutoSync(e.detail.checked)}
            />
            <IonLabel>
              <h3>Always auto-sync clipboard</h3>
              <p>
                Future clipboard content will sync automatically without asking
              </p>
            </IonLabel>
          </IonItem>
        </div>

        <div className="clipboard-sync-actions">
          <IonButton expand="block" color="danger" onClick={handleReject}>
            Reject
          </IonButton>
          <IonButton expand="block" color="primary" onClick={handleAccept}>
            Accept & Sync
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};
