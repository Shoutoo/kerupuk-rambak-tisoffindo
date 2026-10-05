---
version: alpha
name: Tisoffindo Kerupuk Rambak – Design System
description: "Warm, rounded design system for Indonesian traditional food business (kerupuk rambak sapi/kerbau). Inspired by Family Bakery design system from designmd.ai. Cream-stone background, deep brown ink, burnt orange accent — feels like a warm artisan food counter. Used for both public website and internal admin portal."
colors:
  primary: "#1C1917"
  on-primary: "#FFFFFF"
  secondary: "#A8441A"
  on-secondary: "#FFFFFF"
  tertiary: "#F2A054"
  tertiary-hover: "#E88D3A"
  on-tertiary: "#2A1405"
  neutral: "#8E857C"
  soft: "#EDE3D6"
  on-soft: "#3A2618"
  background: "#F4EFE9"
  on-background: "#1C1917"
  surface: "#FFFFFF"
  surface-alt: "#EAE2D8"
  on-surface: "#1C1917"
  on-surface-muted: "#5C554F"
  outline: "#E0D6CA"
  success: "#2F7D4F"
  on-success: "#FFFFFF"
  error: "#B3261E"
  on-error: "#FFFFFF"
typography:
  display:
    fontFamily: Urbanist
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Urbanist
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Urbanist
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Urbanist
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
  body-lg:
    fontFamily: Urbanist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Urbanist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Urbanist
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
  label-md:
    fontFamily: Urbanist
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Urbanist
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.04em
  stat:
    fontFamily: Urbanist
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.01em
rounded:
  none: 0px
  sm: 20px
  md: 999px
  lg: 40px
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  3xl: 96px
  gutter: 24px
  max-width: 1200px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-accent:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 14px 24px
    height: 48px
  button-soft:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.on-soft}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 14px 24px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 48px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-alt:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  nav:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.label-lg}"
    height: 72px
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    padding: 64px 24px
  chip:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.on-soft}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  chip-accent:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 12px
guidelines:
  dos:
    - Use rounded corners on all elements (minimum rounded-xl = 12px)
    - Use Urbanist font for all text (warm, modern, food-friendly)
    - Background color #F4EFE9 (cream) for public pages
    - Amber/orange (#F2A054) as the main accent for CTAs
    - Product photos in rounded containers with object-cover
  donts:
    - No sharp/square corners anywhere on the public website
    - No Supabase config, database schemas, or dev tools in any public-facing UI
    - No hardcoded dates — always use new Date() dynamically
    - No raw API keys or connection strings in source code (use .env)
    - No "Mode Simulasi" or dev debug widgets visible to end users
