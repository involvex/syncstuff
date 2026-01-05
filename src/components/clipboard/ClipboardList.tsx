import { IonList, IonButton, IonIcon, IonText } from "@ionic/react";
import { trashOutline, clipboardOutline } from "ionicons/icons";
import { ClipboardItem } from "./ClipboardItem";
import { useClipboardStore } from "../../store/clipboard.store";
import { useSettingsStore } from "../../store/settings.store";
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
        <IonIcon icon={clipboardOutline} className="empty-icon" />
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
          fill="clear"
          size="small"
          color="danger"
          onClick={clearHistory}
        >
          <IonIcon slot="start" icon={trashOutline} />
          Clear All
        </IonButton>
      </div>

      <IonList>
        {clipboardHistory.map(content => (
          <ClipboardItem
            key={content.id}
            content={content}
            showPreview={clipboardShowPreview}
          />
        ))}
      </IonList>
    </div>
  );
};
