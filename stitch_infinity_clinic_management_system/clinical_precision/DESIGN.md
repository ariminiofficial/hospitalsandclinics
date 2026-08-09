---
name: Clinical Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#cadaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d7e2ff'
  on-surface: '#041b3c'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3052'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#575f69'
  on-secondary: '#ffffff'
  secondary-container: '#dbe3ef'
  on-secondary-container: '#5d656f'
  tertiary: '#432f9c'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b49b5'
  on-tertiary-container: '#d5ccff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#dbe3ef'
  secondary-fixed-dim: '#bfc7d3'
  on-secondary-fixed: '#141c25'
  on-secondary-fixed-variant: '#3f4851'
  tertiary-fixed: '#e5deff'
  tertiary-fixed-dim: '#c9bfff'
  on-tertiary-fixed: '#1a0063'
  on-tertiary-fixed-variant: '#4633a0'
  background: '#f9f9ff'
  on-background: '#041b3c'
  surface-variant: '#d7e2ff'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  token-display:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for **Infinity Clinic**, prioritizing absolute clarity, reliability, and trust. The target audience includes medical practitioners who require rapid data density and patients seeking a seamless, anxiety-reducing booking experience.

The design style is **Corporate / Modern** with a focus on high-functional utility. It utilizes a systematic approach to density, ensuring that complex medical data remains legible while maintaining a welcoming atmosphere through soft accents and generous whitespace in patient-facing flows.

## Colors
The palette is anchored by **Clinical Blue**, a deep, authoritative shade that signals stability. 

- **Primary:** Used for main actions, brand presence, and "Booked" status.
- **Secondary:** A very light tint of the primary, used for background fills and subtle hover states.
- **Semantic Palette:** These colors are strictly reserved for status indicators. Use high-contrast text (usually white or dark navy) over these backgrounds to ensure WCAG AA compliance.
- **Neutral:** A deep navy-gray is used for text to reduce the harshness of pure black while maintaining high legibility.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy environments. 

- **Hierarchy:** Use `headline-xl` only for patient-facing marketing or landing pages. Dashboard views should lead with `headline-md`.
- **Token Numbers:** The `token-display` style is specifically for high-visibility queue numbers on lobby screens.
- **Labels:** Use `label-md` for table headers and small captions above input fields to create a clear structural distinction from data.

## Layout & Spacing
The system follows a strict **8pt grid** to ensure mathematical harmony across all components.

- **Desktop (Receptionist/Doctor Panels):** 12-column fluid grid. Content is divided into a fixed sidebar (240px) and a fluid main content area. Data tables should use `sm` (8px) vertical padding to increase density.
- **Mobile (Patient Booking):** Single-column layout with 16px side margins. Use `lg` (24px) spacing between form sections to reduce cognitive load.
- **Breakpoints:** 
  - Mobile: < 600px
  - Tablet: 600px - 1024px
  - Desktop: > 1024px

## Elevation & Depth
Depth is used sparingly to maintain a clean, clinical feel. 

- **Level 0 (Floor):** Background color (#F4F5F7).
- **Level 1 (Cards):** White background with a 1px border (#DFE1E6). No shadow. This is used for table containers and patient records.
- **Level 2 (Modals):** White background with a soft ambient shadow (0px 8px 24px rgba(9, 30, 66, 0.12)). 
- **Interactive:** Components like buttons use a subtle scale-down (0.98) on click rather than elevation changes to feel tactile and responsive.

## Shapes
The shape language is **Soft**. This balance provides a professional structure (0.25rem/4px) while ensuring the interface doesn't feel aggressive or overly sharp. 

- **Inputs & Buttons:** 4px radius.
- **Cards & Modals:** 8px radius (`rounded-lg`).
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #0052CC with white text.
- **Secondary:** #EBF3FF background with #0052CC text.
- **Ghost:** No background, #42526E text. Used for "Cancel" or secondary navigation.
- **Loading:** Button text is hidden, and a 16px spinner is centered. Disable pointer events.

### Inputs
- **Standard:** 1px border (#DFE1E6). Focus state uses a 2px #0052CC border.
- **Search:** Includes a leading magnifying glass icon.
- **Autocomplete:** Results appear in a Level 2 elevation dropdown.

### Status Badges (Pills)
- **Clinical:** Use a light tint of the semantic color for the background (10% opacity) and the full-strength color for the text. 
- **Payment:** Use solid fills with white text for "Paid" and "Failed" to ensure they are unmissable.

### Token Display
- A high-contrast card with a `secondary_color` border and `token-display` typography. Usually accompanied by a "Next Patient" label.

### WhatsApp Mockups
- **Container:** Light green (#DCF8C6) for incoming system messages. 
- **Font:** Use `body-sm` with a tail-style speech bubble at the bottom corner.

### Tables
- **Header:** `label-md` with a subtle grey background (#F4F5F7).
- **Rows:** 56px height for standard, 48px for dense. Alternating row stripes are not required; use thin dividers instead.

### Navigation
- **Sidebar:** Dark neutral (#172B4D) for Receptionists/Doctors to minimize eye strain during long shifts.
- **Top Navbar:** White with a thin bottom border for the public site, prioritizing "Book Appointment" as a primary button.