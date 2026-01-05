import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonButton,
  IonText,
  IonProgressBar,
  IonFab,
  IonFabButton,
  IonToast,
} from "@ionic/react";
import {
  documentOutline,
  imageOutline,
  folderOutline,
  downloadOutline,
  cloudDownloadOutline,
  addOutline,
} from "ionicons/icons";
import { cloudManagerService } from "../../services/cloud/cloud-manager.service";
import type { CloudAccount, CloudFile } from "../../types/cloud.types";

interface CloudFileBrowserProps {
  account: CloudAccount;
}

export const CloudFileBrowser: React.FC<CloudFileBrowserProps> = ({
  account,
}) => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(
    async (folderId: string = "root") => {
      setIsLoading(true);
      setError(null);
      try {
        const provider = cloudManagerService.getProvider(account.provider);
        if (!provider) throw new Error("Provider not found");

        const fileList = await provider.listFiles(folderId);
        setFiles(fileList);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load files");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [account.provider],
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDownload = async (file: CloudFile) => {
    setDownloadingFileId(file.id);
    try {
      const provider = cloudManagerService.getProvider(account.provider);
      if (!provider) throw new Error("Provider not found");

      const blob = await provider.downloadFile(file.id);

      // For now, trigger a browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToastMessage(`Downloaded ${file.name}`);
    } catch (err: unknown) {
      console.error("Download failed:", err);
      setToastMessage("Download failed");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const provider = cloudManagerService.getProvider(account.provider);
      if (!provider) throw new Error("Provider not found");

      await provider.uploadFile(file);
      setToastMessage(`Uploaded ${file.name}`);
      loadFiles(); // Refresh list
    } catch (err: unknown) {
      console.error("Upload failed:", err);
      setToastMessage("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("folder")) return folderOutline;
    if (mimeType.includes("image")) return imageOutline;
    return documentOutline;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
        <p>Fetching files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ion-text-center ion-padding">
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
        <IonButton fill="clear" onClick={() => loadFiles()}>
          Retry
        </IonButton>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "200px" }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />

      {isUploading && <IonProgressBar type="indeterminate" />}

      <IonList>
        {files.length === 0 ? (
          <IonItem lines="none">
            <IonLabel className="ion-text-center">
              <IonIcon
                icon={cloudDownloadOutline}
                style={{
                  fontSize: "48px",
                  color: "var(--ion-color-medium)",
                  marginTop: "20px",
                }}
              />
              <p>No files found in this account.</p>
            </IonLabel>
          </IonItem>
        ) : (
          files.map(file => (
            <IonItem key={file.id}>
              <IonIcon slot="start" icon={getFileIcon(file.mimeType)} />
              <IonLabel>
                <h2>{file.name}</h2>
                <p>
                  {formatSize(file.size)} •{" "}
                  {new Date(file.modifiedTime).toLocaleDateString()}
                </p>
                {downloadingFileId === file.id && (
                  <IonProgressBar type="indeterminate" />
                )}
              </IonLabel>
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => handleDownload(file)}
                disabled={!!downloadingFileId || isUploading}
              >
                <IonIcon icon={downloadOutline} />
              </IonButton>
            </IonItem>
          ))
        )}
      </IonList>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ""}
        duration={2000}
        onDidDismiss={() => setToastMessage(null)}
      />
    </div>
  );
};
