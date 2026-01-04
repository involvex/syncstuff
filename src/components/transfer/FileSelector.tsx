import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { documentAttach } from "ionicons/icons";

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
        type="file"
        ref={hiddenInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
        disabled={disabled}
      />
      <IonButton expand="block" onClick={handleClick} disabled={disabled}>
        <IonIcon slot="start" icon={documentAttach} />
        Select File
      </IonButton>
    </>
  );
};
