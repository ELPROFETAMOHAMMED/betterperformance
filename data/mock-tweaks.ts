import type { TweakCategory } from "@/types/tweak.types";

export const mockTweaksData: TweakCategory[] = [
  {
    id: "performance",
    name: "Performance",
    icon: "Zap",
    tweaks: [
      {
        id: "disable-windows-updates",
        title: "Disable Windows Updates",
        icon: "Settings",
        description: "Disable automatic Windows updates to improve performance",
        tweak_metadata: {
          report: 12,
          downloadCount: 15420,
          tweakComment: "Works great on Windows 11",
        },
        code: "# Disable Windows Updates\nSet-Service -Name wuauserv -StartupType Disabled\nStop-Service -Name wuauserv\n",
      },
      {
        id: "disable-telemetry",
        title: "Disable Telemetry",
        icon: "Shield",
        description: "Disable Windows telemetry and data collection",
        tweak_metadata: {
          report: 5,
          downloadCount: 23400,
          tweakComment: "Privacy focused tweak",
        },
        code: '# Disable Telemetry\nreg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f\n',
      },
      {
        id: "optimize-cpu",
        title: "Optimize CPU Performance",
        icon: "Cpu",
        description: "Optimize CPU scheduling and power settings",
        tweak_metadata: {
          report: 8,
          downloadCount: 18900,
          tweakComment: "Great for gaming",
        },
        code: "# Optimize CPU\npowercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c\n",
      },
    ],
  },
  {
    id: "network",
    name: "Network",
    icon: "Network",
    tweaks: [
      {
        id: "optimize-dns",
        title: "Optimize DNS Settings",
        icon: "Wifi",
        description: "Set faster DNS servers (Cloudflare, Google)",
        tweak_metadata: {
          report: 3,
          downloadCount: 12300,
          tweakComment: "Faster internet speeds",
        },
        code: '# Optimize DNS\nnetsh interface ip set dns "Wi-Fi" static 1.1.1.1\nnetsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2\n',
      },
      {
        id: "disable-windows-firewall",
        title: "Disable Windows Firewall",
        icon: "Shield",
        description: "Disable Windows Firewall (use at your own risk)",
        tweak_metadata: {
          report: 15,
          downloadCount: 9800,
          tweakComment: "Not recommended for security",
        },
        code: "# Disable Windows Firewall\nnetsh advfirewall set allprofiles state off\n",
      },
    ],
  },
  {
    id: "netwo123124afsdrk",
    name: "Network",
    icon: "Network",
    tweaks: [
      {
        id: "optimize-dns",
        title: "Optimize DNS Settings",
        icon: "Wifi",
        description: "Set faster DNS servers (Cloudflare, Google)",
        tweak_metadata: {
          report: 3,
          downloadCount: 12300,
          tweakComment: "Faster internet speeds",
        },
        code: '# Optimize DNS\nnetsh interface ip set dns "Wi-Fi" static 1.1.1.1\nnetsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2\n',
      },
      {
        id: "disable-windows-firewall",
        title: "Disable Windows Firewall",
        icon: "Shield",
        description: "Disable Windows Firewall (use at your own risk)",
        tweak_metadata: {
          report: 15,
          downloadCount: 9800,
          tweakComment: "Not recommended for security",
        },
        code: "# Disable Windows Firewall\nnetsh advfirewall set allprofiles state off\n",
      },
    ],
  },
  {
    id: "net123412313work",
    name: "Network",
    icon: "Network",
    tweaks: [
      {
        id: "optimize-dns",
        title: "Optimize DNS Settings",
        icon: "Wifi",
        description: "Set faster DNS servers (Cloudflare, Google)",
        tweak_metadata: {
          report: 3,
          downloadCount: 12300,
          tweakComment: "Faster internet speeds",
        },
        code: '# Optimize DNS\nnetsh interface ip set dns "Wi-Fi" static 1.1.1.1\nnetsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2\n',
      },
      {
        id: "disable-windows-firewall",
        title: "Disable Windows Firewall",
        icon: "Shield",
        description: "Disable Windows Firewall (use at your own risk)",
        tweak_metadata: {
          report: 15,
          downloadCount: 9800,
          tweakComment: "Not recommended for security",
        },
        code: "# Disable Windows Firewall\nnetsh advfirewall set allprofiles state off\n",
      },
    ],
  },
  {
    id: "netw23412312ork",
    name: "Network",
    icon: "Network",
    tweaks: [
      {
        id: "optimize-dns",
        title: "Optimize DNS Settings",
        icon: "Wifi",
        description: "Set faster DNS servers (Cloudflare, Google)",
        tweak_metadata: {
          report: 3,
          downloadCount: 12300,
          tweakComment: "Faster internet speeds",
        },
        code: '# Optimize DNS\nnetsh interface ip set dns "Wi-Fi" static 1.1.1.1\nnetsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2\n',
      },
      {
        id: "disable-windows-firewall",
        title: "Disable Windows Firewall",
        icon: "Shield",
        description: "Disable Windows Firewall (use at your own risk)",
        tweak_metadata: {
          report: 15,
          downloadCount: 9800,
          tweakComment: "Not recommended for security",
        },
        code: "# Disable Windows Firewall\nnetsh advfirewall set allprofiles state off\n",
      },
    ],
  },
  {
    id: "netwo2342342rk",
    name: "Network",
    icon: "Network",
    tweaks: [
      {
        id: "optimize-dns",
        title: "Optimize DNS Settings",
        icon: "Wifi",
        description: "Set faster DNS servers (Cloudflare, Google)",
        tweak_metadata: {
          report: 3,
          downloadCount: 12300,
          tweakComment: "Faster internet speeds",
        },
        code: '# Optimize DNS\nnetsh interface ip set dns "Wi-Fi" static 1.1.1.1\nnetsh interface ip add dns "Wi-Fi" 8.8.8.8 index=2\n',
      },
      {
        id: "disable-windows-firewall",
        title: "Disable Windows Firewall",
        icon: "Shield",
        description: "Disable Windows Firewall (use at your own risk)",
        tweak_metadata: {
          report: 15,
          downloadCount: 9800,
          tweakComment: "Not recommended for security",
        },
        code: "# Disable Windows Firewall\nnetsh advfirewall set allprofiles state off\n",
      },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    icon: "HardDrive",
    tweaks: [
      {
        id: "disable-hibernation",
        title: "Disable Hibernation",
        icon: "HardDrive",
        description: "Free up disk space by disabling hibernation",
        tweak_metadata: {
          report: 2,
          downloadCount: 15600,
          tweakComment: "Frees up several GB",
        },
        code: "# Disable Hibernation\npowercfg /hibernate off\n",
      },
      {
        id: "clean-temp-files",
        title: "Clean Temporary Files",
        icon: "Database",
        description: "Remove temporary files and clear cache",
        tweak_metadata: {
          report: 1,
          downloadCount: 21000,
          tweakComment: "Safe cleanup script",
        },
        code: '# Clean Temporary Files\nRemove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue\n',
      },
    ],
  },
  {
    id: "display",
    name: "Display",
    icon: "Monitor",
    tweaks: [
      {
        id: "disable-animations",
        title: "Disable Animations",
        icon: "Monitor",
        description: "Disable Windows animations for better performance",
        tweak_metadata: {
          report: 4,
          downloadCount: 18700,
          tweakComment: "Makes UI snappier",
        },
        code: '# Disable Animations\nreg add "HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics" /v MinAnimate /t REG_SZ /d 0 /f\n',
      },
    ],
  },
  {
    id: "power",
    name: "Power Management",
    icon: "Battery",
    tweaks: [
      {
        id: "high-performance-mode",
        title: "Enable High Performance Mode",
        icon: "Zap",
        description: "Set power plan to high performance",
        tweak_metadata: {
          report: 6,
          downloadCount: 22100,
          tweakComment: "Best for desktop PCs",
        },
        code: "# High Performance Mode\npowercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c\n",
      },
    ],
  },
  {
    id: "input",
    name: "Input Devices",
    icon: "MousePointerClick",
    tweaks: [
      {
        id: "disable-mouse-acceleration",
        title: "Disable Mouse Acceleration",
        icon: "MousePointerClick",
        description: "Disable mouse acceleration for better precision",
        tweak_metadata: {
          report: 2,
          downloadCount: 14500,
          tweakComment: "Great for gaming",
        },
        code: '# Disable Mouse Acceleration\nreg add "HKEY_CURRENT_USER\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f\nreg add "HKEY_CURRENT_USER\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f\nreg add "HKEY_CURRENT_USER\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f\n',
      },
    ],
  },
];
