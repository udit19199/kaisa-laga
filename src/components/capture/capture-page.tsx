"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, Mic } from "lucide-react";
import { extensionForAudioMimeType, getSupportedRecordingMimeType } from "@/lib/audio";
import { MAX_RECORDING_SECONDS } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/capture";
import { t } from "@/lib/i18n/capture";
import { cn } from "@/lib/utils";

type CaptureState = "idle" | "recording" | "uploading" | "done" | "error";

interface CapturePageProps {
  locationId: string;
  locationName: string;
  locale: Locale;
}

const RECORD_SIZE = 136;
const RING_STROKE = 3;
const RING_RADIUS = (RECORD_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const STEP_KEYS = ["stepHold", "stepTalk", "stepRelease"] as const;

function RecordingWaveform({ levels }: { levels: number[] }) {
  return (
    <div className="flex h-7 items-end justify-center gap-[3px]" aria-hidden>
      {levels.map((scale, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[var(--capture-live)] transition-[height] duration-150 ease-out"
          style={{ height: `${Math.max(18, scale * 100)}%` }}
        />
      ))}
    </div>
  );
}

function RecordProgressRing({
  progress,
  showProgress = true,
}: {
  progress: number;
  showProgress?: boolean;
}) {
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full -rotate-90"
      viewBox={`0 0 ${RECORD_SIZE} ${RECORD_SIZE}`}
      aria-hidden
    >
      <circle
        cx={RECORD_SIZE / 2}
        cy={RECORD_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={RING_STROKE}
        className="text-[var(--capture-live-ring)] opacity-35"
      />
      {showProgress ? (
        <circle
          cx={RECORD_SIZE / 2}
          cy={RECORD_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="text-[var(--capture-live)] transition-[stroke-dashoffset] duration-300 ease-out"
        />
      ) : null}
    </svg>
  );
}

function CaptureSteps({
  locale,
  activeStep,
}: {
  locale: Locale;
  activeStep: 0 | 1 | 2;
}) {
  return (
    <ol className="flex w-full max-w-[15rem] list-none justify-between gap-1 p-0">
      {STEP_KEYS.map((key, i) => (
        <li
          key={key}
          className={cn(
            "text-xs transition-colors duration-200 ease-out",
            i === activeStep
              ? "font-semibold text-[var(--capture-ink)]"
              : i < activeStep
                ? "font-medium text-[var(--capture-live)]"
                : "text-[var(--capture-muted)]",
          )}
        >
          {t(locale, key)}
        </li>
      ))}
    </ol>
  );
}

function RoomChrome({ locationName }: { locationName: string }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="min-w-0 flex-1">
        <p className="text-[0.9375rem] font-semibold lowercase tracking-tight text-[var(--capture-ink)]">
          pulsedrop
        </p>
        {locationName ? (
          <h1 className="mt-1 truncate text-base font-medium text-[var(--capture-muted)]">
            {locationName}
          </h1>
        ) : null}
      </div>
    </header>
  );
}

export function CapturePage({ locationId, locationName, locale }: CapturePageProps) {
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveLevels, setWaveLevels] = useState<number[]>([0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const statusId = useId();

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    analyserRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stopWaveform = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setWaveLevels([0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]);
  }, []);

  const startWaveform = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(buffer);
      const slice = Array.from(buffer.slice(0, 7)).map((v) => 0.18 + (v / 255) * 0.82);
      setWaveLevels(slice);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
  }, []);

  const uploadAudio = async (blob: Blob, mimeType: string) => {
    setState("uploading");
    const extension = extensionForAudioMimeType(mimeType);
    const formData = new FormData();
    formData.append("locationId", locationId);
    formData.append("audio", blob, `recording.${extension}`);

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(t(locale, "uploadError"));
    }

    setState("done");
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopWaveform();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, [stopWaveform]);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startWaveform(stream);

      if (typeof navigator.vibrate === "function") {
        navigator.vibrate(12);
      }

      const mimeType = getSupportedRecordingMimeType();

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopWaveform();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          try {
            await uploadAudio(blob, mimeType);
          } catch {
            setState("error");
            setErrorMessage(t(locale, "uploadError"));
          }
        } else {
          setState("idle");
        }
      };

      recorder.start(250);
      setState("recording");
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setState("error");
      setErrorMessage(t(locale, "micError"));
    }
  };

  const recordingProgress = recordingSeconds / MAX_RECORDING_SECONDS;
  const isRecording = state === "recording";
  const isUploading = state === "uploading";
  const isIdle = state === "idle" || state === "error";
  const activeStep: 0 | 1 | 2 = isUploading ? 2 : isRecording ? 1 : 0;

  if (state === "done") {
    return (
      <main className="capture-surface flex min-h-dvh flex-col">
        <RoomChrome locationName={locationName} />
        <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <div className="capture-done-enter max-w-[18rem]">
            <div
              className="mb-5 flex size-14 items-center justify-center rounded-full bg-[var(--capture-live-soft)] text-[var(--capture-live)]"
              aria-hidden
            >
              <Check className="size-7 stroke-[2.5]" />
            </div>
            <h1 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--capture-ink)]">
              {t(locale, "thankYou")}
            </h1>
            <p className="mt-2 max-w-[28ch] text-pretty text-base leading-relaxed text-[var(--capture-muted)]">
              {t(locale, "thankYouMessage")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="capture-surface flex min-h-dvh flex-col">
      <RoomChrome locationName={locationName} />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-10">
        <div className="max-w-[18rem]">
          <h2 className="text-balance text-[1.75rem] font-medium leading-[1.12] tracking-[-0.02em] text-[var(--capture-ink)]">
            {t(locale, "prompt")}
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--capture-muted)]">
            {t(locale, "instruction")}
          </p>
        </div>
      </div>

      <div className="capture-dock relative z-10 rounded-t-2xl bg-[var(--capture-card)] px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7">
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5">
          <CaptureSteps locale={locale} activeStep={activeStep} />

          <div
            className="relative flex items-center justify-center"
            style={{ width: RECORD_SIZE, height: RECORD_SIZE }}
          >
            <RecordProgressRing progress={recordingProgress} showProgress={isRecording} />

            <button
              type="button"
              aria-label={t(locale, "recordAriaLabel")}
              aria-describedby={statusId}
              className={cn(
                "relative z-10 flex select-none items-center justify-center rounded-full bg-[var(--capture-mic)] text-white transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--capture-live)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--capture-card)] active:scale-[0.94]",
                isRecording && "scale-[1.04]",
                isUploading && "pointer-events-none opacity-60",
              )}
              style={{ width: RECORD_SIZE, height: RECORD_SIZE }}
              disabled={isUploading}
              onPointerDown={(e) => {
                e.preventDefault();
                if (isIdle) startRecording();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                if (isRecording) stopRecording();
              }}
              onPointerLeave={(e) => {
                if (isRecording) {
                  e.preventDefault();
                  stopRecording();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {isUploading ? (
                <Loader2 className="size-11 animate-spin" aria-hidden />
              ) : (
                <Mic className="size-11 stroke-[1.75]" aria-hidden />
              )}
            </button>
          </div>

          <div className="flex min-h-[3.25rem] flex-col items-center gap-2">
            <p
              id={statusId}
              role="status"
              aria-live="polite"
              className={cn(
                "capture-status text-center text-sm",
                isRecording
                  ? "font-medium tabular-nums text-[var(--capture-live)]"
                  : "text-[var(--capture-muted)]",
                isUploading && "font-medium text-[var(--capture-ink)]",
              )}
            >
              {isRecording
                ? `${recordingSeconds}s · ${t(locale, "releaseToSend")}`
                : isUploading
                  ? t(locale, "uploading")
                  : t(locale, "holdToTalk")}
            </p>

            {isRecording ? <RecordingWaveform levels={waveLevels} /> : null}

            {isIdle && !errorMessage ? (
              <p className="text-center text-xs text-[var(--capture-muted)]">
                {t(locale, "maxDuration")}
              </p>
            ) : null}

            {errorMessage ? (
              <p role="alert" className="max-w-xs text-center text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <p className="w-full border-t border-[var(--capture-sand)] pt-4 text-center text-xs leading-relaxed text-[var(--capture-muted)]">
            {t(locale, "privacyNote")}
          </p>
        </div>
      </div>
    </main>
  );
}
