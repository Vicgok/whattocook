import type { TextStyle } from "react-native";

export const colors = {
  primary: "#3F6B4F",
  primaryDark: "#294936",
  primarySoft: "#E8F2EA",
  freshGreen: "#A9CEB1",
  background: "#FAFBF7",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F5F0",
  text: "#172019",
  textSecondary: "#687069",
  border: "#DDE3DC",
  accent: "#E8B86A",
  error: "#C84F4F",
  textPrimary: "#172019",
  textMuted: "#687069",
  surfaceSelected: "#E8F2EA",
  placeholder: "#F3F5F0",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;
export const radius = {
  sm: 8,
  md: 12,
  button: 14,
  card: 16,
  lg: 20,
  modal: 24,
  pill: 999,
} as const;
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" },
  screenTitle: { fontSize: 26, lineHeight: 32, fontWeight: "700" },
  recipeTitle: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  sectionHeading: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  button: { fontSize: 16, lineHeight: 20, fontWeight: "600" },
  metadata: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} satisfies Record<string, TextStyle>;
