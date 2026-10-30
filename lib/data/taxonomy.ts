/** Seeded taxonomy, shared by the database seed and the built-in sample data store. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const CATEGORIES = [
  "Finance",
  "Health & Fitness",
  "Education",
  "Productivity",
  "Social",
  "Shopping",
  "Travel",
  "Food & Drink",
  "AI & Chat",
  "Developer Tools",
  "Entertainment",
  "Utilities",
];

export const APP_PATTERNS = [
  "Onboarding",
  "Sign up / Login",
  "Paywall / Upgrade",
  "Home / Feed",
  "Search",
  "Profile",
  "Settings",
  "Checkout",
  "Empty state",
  "Error state",
  "Notifications",
  "Permissions request",
  "Dashboard",
  "Chat",
  "Map",
  "Calendar",
  "Cart",
  "Order tracking",
  "Success / Confirmation",
  "Loading",
];

export const SITE_SECTIONS = [
  "Hero section",
  "Features section",
  "Pricing section",
  "Social proof",
  "Stats section",
  "CTA section",
  "How it works",
  "Navigation section",
  "Footer section",
  "Showcase section",
  "FAQ section",
];

export const UI_ELEMENTS = [
  "Button",
  "Tab bar",
  "Navigation bar",
  "Modal / Bottom sheet",
  "Card",
  "List",
  "Form field",
  "Toggle",
  "Dropdown",
  "Date picker",
  "Toast",
  "Tooltip",
  "Stepper",
  "Progress bar",
  "Avatar",
  "Badge",
  "Chart",
  "Carousel",
];

export const STYLES = [
  "Minimal",
  "Light",
  "Dark",
  "Bold",
  "Colorful",
  "Glass",
  "3D",
  "Illustration",
  "Photography",
  "Grid",
  "Black & White",
  "Motion",
];
