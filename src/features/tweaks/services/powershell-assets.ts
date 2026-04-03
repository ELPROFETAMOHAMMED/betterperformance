import { atomicExecutor } from "@/features/tweaks/templates/atomic-executor";
import { completion } from "@/features/tweaks/templates/completion";
import { logging } from "@/features/tweaks/templates/logging";
import { psHeader } from "@/features/tweaks/templates/ps1-header";
import { restorePoint } from "@/features/tweaks/templates/restore-point";
import { trustedInstaller } from "@/features/tweaks/templates/trusted-installer";

export const completionCode = completion;
export const loggingCode = logging;
export const powershellHeader = psHeader;

export function generateTrustedInstallerFunction(): string {
  return trustedInstaller;
}

export function generateRestorePointFunction(): string {
  return restorePoint;
}

export function generateAtomicTweakFunction(): string {
  return atomicExecutor;
}
