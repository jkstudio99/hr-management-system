// ─────────────────────────────────────────────────────────────────────────────
// Nuxt 3 Configuration — HR Management System
// ─────────────────────────────────────────────────────────────────────────────
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxtjs/google-fonts", "@nuxtjs/i18n"],

  css: ["~/assets/css/main.css"],

  // Auto-import: stores, composables, and all service sub-files
  imports: {
    dirs: ["stores", "composables", "services"],
  },

  // Runtime config — reads from .env at build time
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:3000/api",
      appName: process.env.NUXT_PUBLIC_APP_NAME || "HR Management System",
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || "1.0.0",
    },
  },

  // i18n — Thai default, English fallback
  i18n: {
    locales: [
      { code: "th", name: "ภาษาไทย", file: "th.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
    defaultLocale: "th",
    langDir: "locales",
    strategy: "no_prefix",
  },

  googleFonts: {
    families: {
      "Noto Sans Thai": [300, 400, 500, 600, 700],
      Inter: [400, 500, 600],
    },
    display: "swap",
  },

  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },

  icon: {
    serverBundle: { collections: ["heroicons"] },
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              50: "#FFF7ED",
              100: "#FFEDD5",
              200: "#FED7AA",
              300: "#FDBA74",
              400: "#FB923C",
              500: "#F97316",
              600: "#EA580C",
              700: "#C2410C",
              800: "#9A3412",
              900: "#7C2D12",
              DEFAULT: "#F97316",
            },
            secondary: { DEFAULT: "#00C781", hover: "#00A86B" },
          },
          fontFamily: {
            sans: ["Noto Sans Thai", "Inter", "system-ui", "sans-serif"],
          },
          borderRadius: {
            xl: "12px",
            "2xl": "16px",
          },
          screens: {
            xs: "375px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1440px",
          },
        },
      },
    },
  },

  app: {
    head: {
      title: "HR Management System",
      meta: [
        { name: "description", content: "Enterprise HR Management System" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
});
