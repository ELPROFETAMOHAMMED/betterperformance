import {
  Cpu,
  HardDrive,
  Network,
  Monitor,
  Zap,
  Shield,
  Settings,
  Database,
  Wifi,
  Battery,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Cpu,
  HardDrive,
  Network,
  Monitor,
  Zap,
  Shield,
  Settings,
  Database,
  Wifi,
  Battery,
  MousePointerClick,
};

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Settings; // Default to Settings if icon not found
}

