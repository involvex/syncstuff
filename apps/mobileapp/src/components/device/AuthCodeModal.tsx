import { Clipboard } from "@capacitor/clipboard";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { checkmarkCircle, close, copy, keypad } from "ionicons/icons";
import type React from "react";
import { useEffect, useState } from "react";
import { authCodeService } from "../../services/network/auth-code.service";
import "./AuthCodeModal.css";

interface AuthCodeModalProps {
  isOpen: boolean;
  deviceId: string;
  mode: "display" | "enter";
  onCodeEntered?: (code: string) => void;
  onDismiss: () => void;
}

export const AuthCodeModal: React.FC<AuthCodeModalProps> = ({
  isOpen,
  deviceId,
  mode,
  onCodeEntered,
  onDismiss,
}) => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [enteredCode, setEnteredCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate code when modal opens in display mode
  useEffect(() => {
    if (isOpen && mode === "display") {
      const { code } = authCodeService.generateCode(deviceId);
      setGeneratedCode(code);
      setCopied(false);

      // Update countdown timer
      const interval = setInterval(() => {
        const remaining = authCodeService.getTimeRemaining(code);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, mode, deviceId]);

  // Reset entered code when modal opens in enter mode
  useEffect(() => {
    if (isOpen && mode === "enter") {
      setEnteredCode("");
    }
  }, [isOpen, mode]);

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.write({ string: generatedCode });
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitCode = () => {
    if (enteredCode.length === 6 && onCodeEntered) {
      onCodeEntered(enteredCode);
      setEnteredCode("");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {mode === "display" ? "Auth Code" : "Enter Auth Code"}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-code-modal-content">
        <div className="auth-code-container">
          {mode === "display" && generatedCode && (
            <>
              <IonText className="auth-code-instructions" color="medium">
                <p>Share this code with the device you want to pair with.</p>
              </IonText>

              <div className="auth-code-display">
                <IonIcon color="primary" icon={keypad} size="large" />
                <div className="code-digits">{generatedCode}</div>
              </div>

              <div className="auth-code-timer">
                <IonText color={timeRemaining < 60 ? "danger" : "medium"}>
                  Expires in: <strong>{formatTime(timeRemaining)}</strong>
                </IonText>
              </div>

              <IonButton
                color={copied ? "success" : "primary"}
                expand="block"
                fill={copied ? "solid" : "outline"}
                onClick={handleCopyCode}
              >
                <IonIcon icon={copied ? checkmarkCircle : copy} slot="start" />
                {copied ? "Copied!" : "Copy Code"}
              </IonButton>
            </>
          )}

          {mode === "enter" && (
            <>
              <IonText className="auth-code-instructions" color="medium">
                <p>Enter the 6-digit code displayed on the other device.</p>
              </IonText>

              <div className="auth-code-input-container">
                <IonIcon color="primary" icon={keypad} size="large" />

                <IonItem className="code-input-item">
                  <IonLabel position="stacked">Pairing Code</IonLabel>
                  <IonInput
                    className="code-input"
                    inputmode="numeric"
                    maxlength={6}
                    onIonInput={e =>
                      setEnteredCode(e.detail.value?.slice(0, 6) || "")
                    }
                    placeholder="000000"
                    type="tel"
                    value={enteredCode}
                  />
                </IonItem>
              </div>

              <IonButton
                disabled={enteredCode.length !== 6}
                expand="block"
                onClick={handleSubmitCode}
              >
                <IonIcon icon={checkmarkCircle} slot="start" />
                Pair Device
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
