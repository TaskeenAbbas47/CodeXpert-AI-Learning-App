// src/utils/theme.ts

export const Colors = {
  // --- Dark Mode (Default) ---
  dark: {
    // Basics
    background: '#1f1f3d',    // Deep Blue
    card: '#17173b',          // Lighter Blue
    cardMuted: '#2e2e51',     // Locked/Grayed out
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A5A5C3',
    codeText: '#4eb551',      // 🟢 GREEN text for code in Dark Mode
    
    // Branding
    primary: '#4C6EF5',
    accent: '#FF4C4C',
    success: '#4CAF50',
    warning: '#FF9800',
    
    // UI Elements
    border: '#2D2D55',
    icon: '#FFFFFF',
    buttonMuted: '#2E335A',
    overlay: 'rgba(0,0,0,0.7)',
    shadow: '#000000',
    
    // Chat & Code Specifics
    chatUserBg: '#4C6EF5',    // User Bubble (Blue)
    chatAiBg: '#2E335A',      // 🔵 AI Bubble (Distinct from background)
    codeBg: '#000000',        // Black background for code blocks
    divider: '#1E1E3C',
  },

  // --- Light Mode ---
  light: {
    // Basics
    background: '#F4F6F9',    // Light Grey-Blue
    card: '#FFFFFF',          // Pure White
    cardMuted: '#E5E7EB',
    
    // Text
    textPrimary: '#1A1A3D',
    textSecondary: '#6B7280',
    codeText: '#2E7D32',      // 🟢 Darker GREEN text for code in Light Mode
    
    // Branding
    primary: '#4C6EF5',
    accent: '#FF4C4C',
    success: '#4CAF50',
    warning: '#FF9800',

    // UI Elements
    border: '#D1D5DB',
    icon: '#1A1A3D',
    buttonMuted: '#E5E7EB',
    overlay: 'rgba(0,0,0,0.3)',
    shadow: '#000000',
    
    // Chat & Code Specifics
    chatUserBg: '#4C6EF5',    // User Bubble (Blue)
    chatAiBg: '#E2E8F0',      // ⚪️ Grey Bubble (Visible on White Card)
    codeBg: '#F1F5F9',        // Light Grey background for code
    divider: '#E5E7EB',
  },
};