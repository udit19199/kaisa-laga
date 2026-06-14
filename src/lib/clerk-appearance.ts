import { shadcn } from "@clerk/ui/themes";

const marketingInk = "#080808";
const marketingMuted = "#898989";
const marketingLine = "#e5e5e5";
const marketingUi = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** Dashboard shell — inherits shadcn CSS variables (light/dark via ThemeProvider). */
export const clerkDashboardAppearance = {
  theme: shadcn,
} as const;

/**
 * Consumer + operator auth on light surfaces — explicit tokens so Clerk does not
 * inherit the dashboard dark theme on white pages.
 */
export const clerkLightAppearance = {
  variables: {
    colorPrimary: marketingInk,
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: marketingInk,
    colorMuted: "#f7f7f7",
    colorMutedForeground: marketingMuted,
    colorInput: "#ffffff",
    colorInputForeground: marketingInk,
    colorBorder: marketingLine,
    colorNeutral: marketingInk,
    colorRing: "rgba(229, 107, 60, 0.35)",
    colorDanger: "#dc2626",
    borderRadius: "1rem",
    fontFamily: marketingUi,
    fontFamilyButtons: marketingUi,
  },
  options: {
    logoPlacement: "none" as const,
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "bottom" as const,
  },
  elements: {
    rootBox: "w-full",
    cardBox: "rounded-3xl shadow-none",
    card: "shadow-none",
    formButtonPrimary: "rounded-full shadow-none",
    formFieldInput: "rounded-2xl",
    socialButtonsBlockButton: "rounded-2xl",
    userButtonPopoverCard: "rounded-2xl shadow-lg",
    userButtonPopoverActionButton: "rounded-xl",
    userButtonPopoverFooter: "hidden",
  },
};

export const clerkProviderAppearance = clerkDashboardAppearance;
