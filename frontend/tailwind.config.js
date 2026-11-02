/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Theme from C:\HTML\Payroll-frontend
        primary: {
          DEFAULT: '#2563EB', // Blue
          hover: '#1D4ED8',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        success: '#16A34A',     // Green
        danger: '#DC2626',      // Red
        warning: '#F59E0B',     // Yellow

        accent: {
          yellow: '#FACC15',    // Gold Yellow
          hover: '#EAB308',
        },

        surface: '#FFFFFF',
        muted: '#F1F5F9',
        background: '#F8FAFC',

        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },

        // Backward compatibility mappings aligned to the new theme
        brand: {
          light: '#EFF6FF',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          accent: '#FACC15',
        },
        content: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
};