import { IonButton, IonIcon, IonList, IonText } from "@ionic/react";
import { clipboardOutline, trashOutline } from "ionicons/icons";
import { useClipboardStore } from "../../store/clipboard.store";
import { useSettingsStore } from "../../store/settings.store";
import { ClipboardItem } from "./ClipboardItem";
import "./ClipboardList.css";

export const ClipboardList: React.FC = () => {
  const clipboardHistory = useClipboardStore(state => state.clipboardHistory);
  const clearHistory = useClipboardStore(state => state.clearHistory);
  const clipboardShowPreview = useSettingsStore(
    state => state.clipboardShowPreview,
  );

  if (clipboardHistory.length === 0) {
    return (
      <div className="clipboard-list-empty">
        <IonIcon className="empty-icon" icon={clipboardOutline} />
        <IonText>
          <h2>No clipboard history</h2>
          <p>Copy something to get started</p>
        </IonText>
      </div>
    );
  }

  return (
    <div className="clipboard-list-container">
      <div className="clipboard-list-header">
        <IonText>
          <h3>
            {clipboardHistory.length}{" "}
            {clipboardHistory.length === 1 ? "item" : "items"}
          </h3>
        </IonText>
        <IonButton
          color="danger"
          fill="clear"
          onClick={clearHistory}
          size="small"
        >
          <IonIcon icon={trashOutline} slot="start" />
          Clear All
        </IonButton>
      </div>

      <IonList>
        {clipboardHistory.map(content => (
          <ClipboardItem
            content={content}
            key={content.id}
            showPreview={clipboardShowPreview}
          />
        ))}
      </IonList>
    </div>
  );
};
