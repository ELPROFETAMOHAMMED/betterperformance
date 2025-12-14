# BetterPerformance

<div align="center">

**Optimize Windows Performance the Right Way**

A modern, safe, and user-friendly platform for customizing and optimizing Windows systems through curated, reversible tweaks.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com/)

</div>

---

## 🚀 What is BetterPerformance?

BetterPerformance is a comprehensive web application designed for Windows power users who want to optimize their system's performance without diving into obscure forums or risking their system stability. It provides a curated collection of safe, reversible Windows tweaks that you can combine, preview, and apply with confidence.

### Key Features

- ✅ **Safe & Reversible** - All tweaks are carefully curated and can be easily undone
- ⚡ **Performance Boost** - Proven tweaks that actually improve Windows performance
- 🔄 **Easy Rollback** - Every change is documented and reversible
- 👁️ **Transparent Code** - See exactly what each tweak does before applying
- 🎛️ **Manual Control** - Download and review PowerShell scripts before execution
- 📚 **Tweak History** - Save your favorite combinations for quick access
- 🎨 **Modern UI** - Beautiful, intuitive interface built with React and Next.js
- 🔐 **Secure** - User authentication and secure session management

---

## 💡 Why BetterPerformance?

### The Problem

Windows optimization typically requires:
- Scouring through countless forums and Reddit threads
- Running risky scripts from unknown sources
- Manually editing registry keys without understanding the impact
- No easy way to revert changes if something goes wrong
- Lack of transparency about what each tweak actually does

### The Solution

BetterPerformance solves all of these problems by providing:

1. **Curated Tweaks** - Only safe, tested tweaks that have been verified
2. **Visual Code Editor** - Preview and edit PowerShell scripts before downloading
3. **Combination Builder** - Select multiple tweaks and combine them into a single script
4. **History & Favorites** - Save your configurations for future use
5. **Full Transparency** - Every tweak shows its code, description, and impact
6. **Safety First** - Built-in warnings and restore point recommendations

---

## 🎯 How It Works

### 1. **Browse & Select Tweaks**
Navigate through categorized tweaks, each with detailed descriptions explaining what they do and why they're safe. Use the search and filter functionality to find exactly what you need.

### 2. **Preview & Customize**
Before downloading, preview the combined PowerShell script in the built-in code editor. You can:
- See syntax-highlighted code
- Edit the script if needed
- Review all changes that will be applied
- Understand the impact of each tweak

### 3. **Download & Apply**
Download the generated PowerShell script (.ps1 file) and review it on your system. When ready, run it with administrator privileges. The application recommends creating a system restore point before applying changes.

### 4. **Track & Manage**
Save your favorite tweak combinations to your history for quick access later. Each saved configuration includes metadata like creation date and tweak count.

---

## ✨ Advantages

### For Power Users
- **Maximum Performance** - Unlock the full potential of your Windows system
- **Time Savings** - No more hunting through forums for reliable tweaks
- **Customization** - Tailor Windows to your specific needs and preferences
- **Control** - You decide what to apply and when

### For Regular Users
- **Safety** - All tweaks are vetted and reversible
- **Simplicity** - No need to understand PowerShell or registry editing
- **Guidance** - Clear descriptions and warnings for each tweak
- **Confidence** - See exactly what will happen before applying changes

### Technical Benefits
- **Modern Stack** - Built with Next.js 15, React 19, and TypeScript
- **Fast Performance** - Optimized rendering with code splitting and lazy loading
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Real-time Updates** - Live code preview and syntax highlighting
- **Secure Authentication** - Powered by Supabase for secure user management

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.9** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### Backend & Services
- **Supabase** - Authentication and database
- **Next.js API Routes** - Server-side endpoints
- **PowerShell** - Script generation and execution

### Development Tools
- **Turbopack** - Fast bundler for development
- **ESLint** - Code quality and linting
- **pnpm** - Efficient package management

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- A Supabase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd betterperformance
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## 🎨 Features in Detail

### Code Editor
- **Syntax Highlighting** - PowerShell syntax highlighting for better readability
- **Line Numbers** - Optional line numbers for code navigation
- **Edit Mode** - Modify scripts before downloading
- **Word Wrap** - Toggle word wrapping for long lines
- **Sensitive Data Hiding** - Option to obfuscate sensitive values

### Tweak Management
- **Categories** - Organized tweaks by category (Performance, UI, Security, etc.)
- **Search** - Quick search across all tweaks and categories
- **Filters** - Filter by selected tweaks, popularity, or reported issues
- **Selection** - Multi-select tweaks to combine into a single script

### History & Favorites
- **Save Configurations** - Save your tweak combinations with custom names
- **Favorites** - Mark configurations as favorites for quick access
- **History Tracking** - View all your past tweak applications
- **Quick Re-download** - Re-download previous configurations instantly

### User Experience
- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Works on all screen sizes
- **Loading States** - Smooth loading indicators for better UX
- **Error Handling** - Graceful error handling with user-friendly messages

---

## 🔒 Security & Safety

- **No Automatic Execution** - Scripts are downloaded, never executed automatically
- **User Review Required** - You must review and manually run scripts
- **Restore Point Recommendations** - Built-in prompts to create system restore points
- **Transparent Code** - Full visibility into what each script does
- **Secure Authentication** - Industry-standard authentication via Supabase
- **Session Management** - Secure session handling with proper cookie management

---

## 📝 Best Practices

1. **Always Review Scripts** - Read through the generated PowerShell script before running
2. **Create Restore Points** - Use Windows System Restore before applying tweaks
3. **Start Small** - Test with a few tweaks first before applying many at once
4. **Backup Important Data** - Ensure important files are backed up
5. **Understand Each Tweak** - Read the description and understand what each tweak does

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

Built with modern web technologies and designed with user experience and safety in mind. Special thanks to the open-source community for the amazing tools and libraries that make this possible.

---

<div align="center">

**Made with ❤️ for Windows power users**

[Report Bug](https://github.com/your-repo/issues) · [Request Feature](https://github.com/your-repo/issues)

</div>
