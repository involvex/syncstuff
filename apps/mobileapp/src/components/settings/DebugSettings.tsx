import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  IonTextarea,
  IonIcon,
  useIonToast,
} from "@ionic/react";
import { bugOutline, copyOutline, trashOutline } from "ionicons/icons";
import React, { useEffect, useState, useRef } from "react";
import { useSettingsStore } from "../../store/settings.store";
import { logger, type LogEntry } from "../../services/logging/logger.service";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import pkg from "../../../package.json";

export const DebugSettings: React.FC = () => {
  const {
    devMode,
    verboseLogging,
    setVerboseLogging,
    traceHandshake,
    setTraceHandshake,
  } = useSettingsStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, unknown>>({});
  const [autoScroll, setAutoScroll] = useState(true);
  const logTextareaRef = useRef<HTMLIonTextareaElement>(null);
  const [presentToast] = useIonToast();

  useEffect(() => {
    if (!devMode) return;

    // Load device info
    const loadDeviceInfo = async () => {
      try {
        const info = await Device.getInfo();
        const id = await Device.getId();
        setDeviceInfo({
          platform: Capacitor.getPlatform(),
          model: info.model,
          manufacturer: info.manufacturer,
          osVersion: info.osVersion,
          appVersion: pkg.version,
          deviceId: id.identifier,
          isVirtual: info.isVirtual,
        });
      } catch (error) {
        console.error("Failed to load device info:", error);
      }
    };

    loadDeviceInfo();

    // Subscribe to log entries
    const unsubscribe = logger.subscribe(entry => {
      setLogs(prev => {
        const newLogs = [...prev, entry].slice(-500); // Keep last 500 entries
        return newLogs;
      });

      // Auto-scroll to bottom if enabled
      if (autoScroll && logTextareaRef.current) {
        setTimeout(() => {
          const textarea = logTextareaRef.current?.querySelector("textarea");
          if (textarea) {
            textarea.scrollTop = textarea.scrollHeight;
          }
        }, 100);
      }
    });

    // Load existing logs
    setLogs(logger.getLogs(500));

    return () => {
      unsubscribe();
    };
  }, [devMode, autoScroll]);

  const formatLogEntry = (entry: LogEntry): string => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.padEnd(5);
    const argsStr =
      entry.args.length > 0 ? ` ${JSON.stringify(entry.args, null, 2)}` : "";
    return `[${time}] [${level}] ${entry.message}${argsStr}`;
  };

  const copyLogs = async () => {
    const logText = logs.map(formatLogEntry).join("\n");
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(logText);
        presentToast({
          message: "Logs copied to clipboard",
          duration: 2000,
          color: "success",
        });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = logText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        presentToast({
          message: "Logs copied to clipboard",
          duration: 2000,
          color: "success",
        });
      }
    } catch (_error) {
      presentToast({
        message: "Failed to copy logs",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    presentToast({
      message: "Logs cleared",
      duration: 2000,
      color: "success",
    });
  };

  if (!devMode) {
    return null;
  }

  const logText = logs.map(formatLogEntry).join("\n");

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={bugOutline} style={{ marginRight: "8px" }} />
          Debug & Logging
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h3>Verbose Logging</h3>
              <p>Show detailed debug logs</p>
            </IonLabel>
            <IonToggle
              checked={verboseLogging}
              onIonChange={e => setVerboseLogging(e.detail.checked)}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Trace Handshake</h3>
              <p>Log WebRTC handshake details</p>
            </IonLabel>
            <IonToggle
              checked={traceHandshake}
              onIonChange={e => setTraceHandshake(e.detail.checked)}
            />
          </IonItem>
        </IonList>

        <div style={{ marginTop: "16px" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Device Info
          </h3>
          <div
            style={{
              backgroundColor: "var(--ion-color-light)",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "monospace",
            }}
          >
            {Object.entries(deviceInfo).map(([key, value]) => (
              <div key={key} style={{ marginBottom: "4px" }}>
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: 0 }}>
              Logs ({logs.length})
            </h3>
            <div>
              <IonButton
                size="small"
                fill="clear"
                onClick={copyLogs}
                style={{ marginRight: "8px" }}
              >
                <IonIcon icon={copyOutline} slot="icon-only" />
              </IonButton>
              <IonButton
                size="small"
                fill="clear"
                color="danger"
                onClick={clearLogs}
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </div>
          </div>
          <IonTextarea
            ref={logTextareaRef}
            value={logText}
            readonly
            rows={10}
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              backgroundColor: "var(--ion-color-dark)",
              color: "var(--ion-color-light)",
              padding: "8px",
              borderRadius: "4px",
            }}
          />
          <IonItem>
            <IonLabel>
              <h3>Auto-scroll</h3>
            </IonLabel>
            <IonToggle
              checked={autoScroll}
              onIonChange={e => setAutoScroll(e.detail.checked)}
            />
          </IonItem>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
