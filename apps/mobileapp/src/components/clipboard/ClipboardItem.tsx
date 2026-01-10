import {
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonButton,
  IonThumbnail,
} from "@ionic/react";
import {
  copyOutline,
  trashOutline,
  documentTextOutline,
  imageOutline,
} from "ionicons/icons";
import type { ClipboardContent } from "../../types/clipboard.types";
import { clipboardService } from "../../services/sync/clipboard.service";
import { useClipboardStore } from "../../store/clipboard.store";
import "./ClipboardItem.css";

interface ClipboardItemProps {
  content: ClipboardContent;
  showPreview?: boolean;
}

export const ClipboardItem: React.FC<ClipboardItemProps> = ({
  content,
  showPreview = true,
}) => {
  const removeFromHistory = useClipboardStore(state => state.removeFromHistory);

  const handleCopyToClipboard = async () => {
    try {
      if (content.type === "text") {
        await clipboardService.writeText(content.content);
      } else if (content.type === "image") {
        await clipboardService.writeImage(content.content, content.mimeType);
      }
      console.log("Content copied to clipboard");
      // Could show a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleDelete = () => {
    removeFromHistory(content.id);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getPreview = () => {
    if (!showPreview) return null;

    if (content.type === "text") {
      const preview = content.content.substring(0, 100);
      return (
        <p className="clipboard-item-preview">
          {preview}
          {content.content.length > 100 ? "..." : ""}
        </p>
      );
    } else if (content.type === "image") {
      // Show image thumbnail
      const dataUrl = content.content.startsWith("data:")
        ? content.content
        : `data:${content.mimeType || "image/png"};base64,${content.content}`;

      return (
        <IonThumbnail slot="start" className="clipboard-item-thumbnail">
          <img src={dataUrl} alt="Clipboard image" />
        </IonThumbnail>
      );
    }
    return null;
  };

  const getContentTypeIcon = () => {
    return content.type === "image" ? imageOutline : documentTextOutline;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <IonItem className="clipboard-item">
      {content.type === "image" && getPreview()}

      <IonIcon
        icon={getContentTypeIcon()}
        slot="start"
        className="clipboard-item-icon"
      />

      <IonLabel>
        <div className="clipboard-item-header">
          <h3>{content.type === "image" ? "Image" : "Text"}</h3>
          <IonNote>{formatTimestamp(content.timestamp)}</IonNote>
        </div>

        {content.type === "text" && getPreview()}

        <IonNote>
          {content.synced ? `From ${content.deviceName}` : "Local"} •{" "}
          {formatSize(content.size)}
        </IonNote>
      </IonLabel>

      <IonButton fill="clear" slot="end" onClick={handleCopyToClipboard}>
        <IonIcon icon={copyOutline} />
      </IonButton>

      <IonButton fill="clear" slot="end" color="danger" onClick={handleDelete}>
        <IonIcon icon={trashOutline} />
      </IonButton>
    </IonItem>
  );
};
