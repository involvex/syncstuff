import { IonButton, IonIcon } from "@ionic/react";
import { documentAttach } from "ionicons/icons";
import React from "react";

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFileSelect,
  disabled,
}) => {
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    hiddenInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        disabled={disabled}
        onChange={handleChange}
        ref={hiddenInputRef}
        style={{ display: "none" }}
        type="file"
      />
      <IonButton disabled={disabled} expand="block" onClick={handleClick}>
        <IonIcon icon={documentAttach} slot="start" />
        Select File
      </IonButton>
    </>
  );
};
