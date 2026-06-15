"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, Pause, Play } from "lucide-react";
import { extensionForAudioMimeType, getSupportedRecordingMimeType } from "@/lib/audio";
import { MAX_RECORDING_SECONDS, MIN_RECORDING_SECONDS, DEFAULT_RECORD_SIZE } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/capture";
import { t } from "@/lib/i18n/capture";
import {
  RecordProgressRing,
  RecordingWaveform,
} from "@/components/capture/record-primitives";
import { cn } from "@/lib/utils";
import { DINER_SIGN_IN_PATH } from "@/lib/auth-routes";

type CaptureState = "idle" | "recording" | "uploading" | "done" | "error";

interface CapturePageProps {
  captureToken: string;
  locationName: string;
  locale: Locale;
}

const RECORD_SIZE = DEFAULT_RECORD_SIZE;

function RoomChrome({ locationName }: { locationName: string }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="min-w-0 flex-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--capture-muted)] shadow-sm backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-[var(--capture-live)] shadow-[0_0_0_4px_var(--capture-live-soft)]" />
          Kaisa Laga
        </div>
        {locationName ? (
          <span className="mt-2 inline-block max-w-full truncate rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm font-medium text-[var(--capture-muted)] shadow-sm">
            {locationName}
          </span>
        ) : null}
      </div>
    </header>
  );
}

function CaptureDonePage({
  locale,
  locationName,
  submissionId,
}: {
  locale: Locale;
  locationName: string;
  submissionId: string | null;
}) {
  return (
    <div className="capture-surface flex min-h-dvh flex-col">
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
          {submissionId ? (
            <Link
              href={`${DINER_SIGN_IN_PATH}?link=${encodeURIComponent(submissionId)}`}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[var(--capture-ink)] px-5 text-sm font-medium text-white no-underline"
            >
              Build your taste profile
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CapturePage({ captureToken, locationName, locale }: CapturePageProps) {
  const [pageState, setPageState] = useState({
    state: "idle" as CaptureState,
    errorMessage: null as string | null,
    submissionId: null as string | null,
    recordingSeconds: 0,
    waveLevels: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2] as number[],
  });
  const { state, errorMessage, submissionId, recordingSeconds, waveLevels } = pageState;
  const [retainAudio, setRetainAudio] = useState(false);

  const setState = useCallback((s: CaptureState | ((curr: CaptureState) => CaptureState)) => {
    setPageState((prev) => ({ ...prev, state: typeof s === "function" ? s(prev.state) : s }));
  }, []);
  const setErrorMessage = useCallback((m: string | null) => {
    setPageState((prev) => ({ ...prev, errorMessage: m }));
  }, []);
  const setSubmissionId = useCallback((id: string | null) => {
    setPageState((prev) => ({ ...prev, submissionId: id }));
  }, []);
  const setRecordingSeconds = useCallback((s: number | ((curr: number) => number)) => {
    setPageState((prev) => ({ ...prev, recordingSeconds: typeof s === "function" ? s(prev.recordingSeconds) : s }));
  }, []);
  const setWaveLevels = useCallback((w: number[] | ((curr: number[]) => number[])) => {
    setPageState((prev) => ({ ...prev, waveLevels: typeof w === "function" ? w(prev.waveLevels) : w }));
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retainAudioRef = useRef(retainAudio);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const startingRef = useRef(false);
  const statusId = useId();

  useEffect(() => {
    retainAudioRef.current = retainAudio;
  }, [retainAudio]);

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
  }, [setWaveLevels]);

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
  }, [setWaveLevels]);

  const uploadAudio = async (blob: Blob, mimeType: string) => {
    setState("uploading");
    const extension = extensionForAudioMimeType(mimeType);
    const formData = new FormData();
    formData.append("captureToken", captureToken);
    formData.append("retentionConsent", String(retainAudioRef.current));
    formData.append("audio", blob, `recording.${extension}`);
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKeyRef.current,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(t(locale, "uploadError"));
    }

    const data = (await response.json()) as { id?: string };
    setSubmissionId(data.id ?? null);
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
    if (startingRef.current) {
      return;
    }

    startingRef.current = true;
    try {
      setErrorMessage(null);
      idempotencyKeyRef.current = crypto.randomUUID();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // The waveform is purely decorative. If the browser refuses AudioContext
      // or analyser setup, we still want to capture the actual audio.
      try {
        startWaveform(stream);
      } catch (waveformError) {
        console.warn("Waveform initialization failed; continuing without visualization.", waveformError);
      }

      if (typeof navigator.vibrate === "function") {
        navigator.vibrate(12);
      }

      const mimeType = getSupportedRecordingMimeType();

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopWaveform();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType });
        if (blob.size > 0) {
          try {
            await uploadAudio(blob, recorder.mimeType || mimeType);
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
      cleanup();
      setState("error");
      setErrorMessage(t(locale, "micError"));
    } finally {
      startingRef.current = false;
    }
  };

  const recordingProgress = recordingSeconds / MAX_RECORDING_SECONDS;
  const isRecording = state === "recording";
  const canStopRecording = recordingSeconds >= MIN_RECORDING_SECONDS;
  const recordAriaLabel = isRecording
    ? canStopRecording
      ? t(locale, "pauseToStop")
      : `${t(locale, "speakAtLeast")} ${MIN_RECORDING_SECONDS}s before pausing`
    : t(locale, "tapToRecord");

  if (state === "done") {
    return (
      <CaptureDonePage
        locale={locale}
        locationName={locationName}
        submissionId={submissionId}
      />
    );
  }

  return (
    <div className="capture-surface flex min-h-dvh flex-col">
      <RoomChrome locationName={locationName} />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-10">
        <div className="max-w-[20rem]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--capture-live)]/15 bg-white/40 px-3 py-1 text-[0.72rem] font-medium text-[var(--capture-muted)] shadow-[0_8px_24px_-16px_var(--capture-live)] backdrop-blur-sm">
            <span className="size-2 rounded-full bg-[var(--capture-live)]" />
            Quick voice note
            <span className="text-[var(--capture-ink)]">3-30 seconds</span>
          </div>
          <h2 className="text-balance text-[clamp(2.1rem,7vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--capture-ink)]">
            {t(locale, "prompt")}
          </h2>
          <p className="mt-4 max-w-[28ch] text-pretty text-[0.96rem] leading-relaxed text-[var(--capture-muted)]">
            {t(locale, "instruction")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[0.72rem] font-medium">
            <span className="rounded-full border border-[var(--capture-live)]/15 bg-white/55 px-3 py-1 text-[var(--capture-ink)]">
              Tap play
            </span>
            <span className="rounded-full border border-[var(--capture-live)]/15 bg-white/55 px-3 py-1 text-[var(--capture-ink)]">
              Speak 3-30s
            </span>
            <span className="rounded-full border border-[var(--capture-live)]/15 bg-white/55 px-3 py-1 text-[var(--capture-ink)]">
              Tap pause
            </span>
          </div>
        </div>
      </div>

      <CaptureControls
        state={state}
        recordingProgress={recordingProgress}
        canStopRecording={canStopRecording}
        recordingSeconds={recordingSeconds}
        waveLevels={waveLevels}
        retainAudio={retainAudio}
        setRetainAudio={setRetainAudio}
        errorMessage={errorMessage}
        statusId={statusId}
        recordAriaLabel={recordAriaLabel}
        startRecording={startRecording}
        stopRecording={stopRecording}
        locale={locale}
      />
    </div>
  );
}

interface CaptureControlsProps {
  state: CaptureState;
  recordingProgress: number;
  canStopRecording: boolean;
  recordingSeconds: number;
  waveLevels: number[];
  retainAudio: boolean;
  setRetainAudio: (val: boolean) => void;
  errorMessage: string | null;
  statusId: string;
  recordAriaLabel: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  locale: Locale;
}

function CaptureControls({
  state,
  recordingProgress,
  canStopRecording,
  recordingSeconds,
  waveLevels,
  retainAudio,
  setRetainAudio,
  errorMessage,
  statusId,
  recordAriaLabel,
  startRecording,
  stopRecording,
  locale,
}: CaptureControlsProps) {
  const isRecording = state === "recording";
  const isUploading = state === "uploading";
  const isIdle = state === "idle";
  return (
    <div className="capture-dock relative rounded-t-2xl border-t border-[var(--capture-sand)] bg-[var(--capture-card)] px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_40px_-24px_oklch(0_0_0/0.2)]">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5">
        <div
          className="relative flex items-center justify-center"
          style={{ width: RECORD_SIZE, height: RECORD_SIZE }}
        >
          <RecordProgressRing
            size={RECORD_SIZE}
            progress={recordingProgress}
            showProgress={isRecording}
            progressClassName="transition-[stroke-dashoffset] duration-300 ease-out"
          />

          <button
            type="button"
            aria-label={recordAriaLabel}
            aria-describedby={statusId}
            className={cn(
              "relative z-10 flex select-none items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(135deg,var(--capture-mic),var(--capture-join))] text-white shadow-[0_24px_60px_-18px_var(--capture-join)] transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--capture-live)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--capture-card)] active:scale-[0.94]",
              isRecording && "scale-[1.04]",
              (isUploading || (isRecording && !canStopRecording)) && "pointer-events-none opacity-60",
            )}
            style={{ width: RECORD_SIZE, height: RECORD_SIZE }}
            disabled={isUploading || (isRecording && !canStopRecording)}
            onClick={() => {
              if (isRecording) {
                if (canStopRecording) {
                  stopRecording();
                }
              } else if (isIdle) {
                void startRecording();
              }
            }}
          >
            {isUploading ? (
              <Loader2 className="size-11 animate-spin" aria-hidden />
            ) : isRecording ? (
              <Pause className="size-11 stroke-[1.75]" aria-hidden />
            ) : (
              <Play className="size-11 fill-current stroke-[1.75] pl-0.5" aria-hidden />
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
              ? recordingSeconds < MIN_RECORDING_SECONDS
                ? `${recordingSeconds}s · ${t(locale, "speakAtLeast")}`
                : `${recordingSeconds}s · ${t(locale, "pauseToStop")}`
              : isUploading
                ? t(locale, "uploading")
                : t(locale, "tapToRecord")}
          </p>

          {isRecording ? <RecordingWaveform levels={waveLevels} /> : null}

          {isIdle && !errorMessage ? (
            <p className="text-center text-xs font-medium text-[var(--capture-muted)]">
              {t(locale, "durationHint")}
            </p>
          ) : null}

          {isRecording && recordingSeconds < MIN_RECORDING_SECONDS ? (
            <p className="text-center text-xs font-medium text-[var(--capture-live)]">
              {t(locale, "speakAtLeast")} {MIN_RECORDING_SECONDS}s.
            </p>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="max-w-xs text-center text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="w-full border-t border-[var(--capture-sand)] pt-4 text-center text-xs leading-relaxed text-[var(--capture-muted)]">
          <p>{t(locale, "privacyNote")}</p>
          <label className="mt-3 flex items-start justify-center gap-2 text-left">
            <input
              type="checkbox"
              checked={retainAudio}
              onChange={(event) => setRetainAudio(event.target.checked)}
              className="mt-0.5 size-4 rounded border-[var(--capture-sand)] text-[var(--capture-live)] accent-[var(--capture-live)]"
            />
            <span className="max-w-[20rem]">
              <span className="block font-medium text-[var(--capture-ink)]">
                {t(locale, "retentionConsent")}
              </span>
              <span className="block text-[var(--capture-muted)]">
                {t(locale, "retentionConsentNote")}
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
