# Design System - MindSprint (MindSprint Productivity Suite)

## Design Tokens & System Theme (Design MD)

```yaml
name: MindSprint
colors:
  surface: '#fff8f6'
  surface-dim: '#f0d4cf'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#ffe9e6'
  surface-container-high: '#ffe2dd'
  surface-container-highest: '#f9dcd8'
  on-surface: '#271815'
  on-surface-variant: '#5b403c'
  inverse-surface: '#3e2c29'
  inverse-on-surface: '#ffedea'
  outline: '#8f706b'
  outline-variant: '#e3beb8'
  surface-tint: '#b72216'
  primary: '#b31f14'
  on-primary: '#ffffff'
  primary-container: '#d73a2a'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a8'
  secondary: '#0058bf'
  on-secondary: '#ffffff'
  secondary-container: '#2771e2'
  on-secondary-container: '#fefcff'
  tertiary: '#006b1d'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b8729'
  on-tertiary-container: '#f7fff1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930001'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004396'
  tertiary-fixed: '#8dfb8c'
  tertiary-fixed-dim: '#71dd73'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005314'
  background: '#fff8f6'
  on-background: '#271815'
  surface-variant: '#f9dcd8'
typography:
  display-lg:
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
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 24px
  gutter: 16px
```

## Brand & Style
The design system is centered on the concept of "cognitive clarity." It facilitates high-focus productivity by removing visual noise and emphasizing actionable tasks. The brand personality is efficient, reliable, and energizing without being overwhelming.

The design style is **Corporate / Modern Minimalism**. It utilizes a "Layered Canvas" approach where depth is communicated through subtle shifts in neutral tones rather than heavy shadows. The interface prioritizes whitespace and precise alignment to create a sense of order, reflecting the state of mind a user achieves when their tasks are organized.

## Colors
The palette is anchored by a warm off-white canvas that reduces eye strain during long focus sessions. 

- **Primary (Coral Red):** Reserved for the "Sprint" action, primary buttons, and urgent priorities (#B31F14 / #E44332).
- **Surface Strategy:** Use pure white (#FFFFFF) for interactive elements and task containers to make them pop against the off-white (#FAF9F7 / #FFF8F6) background.
- **Accents:** Tangerine, Clover, Blueberry, and Lavender are used exclusively for categorization (labels, projects) and priority levels 2 through 4.
- **Status Colors:** Use Clover for completion and Blueberry for scheduled/upcoming states.

## Typography
This design system utilizes **Inter** for its neutral, highly legible characteristics. 

- **Hierarchy:** Use `display-lg` exclusively for the Pomodoro timer digits. 
- **Readability:** Task titles should use `body-md` with a 600 weight for better scannability in lists.
- **Metadata:** Use `label-md` for dates, project names, and sub-tasks to create a clear visual distinction from the primary task text.
- **Mobile:** On mobile devices, `display-lg` should scale down to 28px to ensure the timer remains central without pushing content off-screen.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density vertical spacing.

- **Sidebar:** A collapsible left-hand navigation (280px width) manages project lists and filters.
- **Main Content:** Centered single-column task list with a max-width of 800px to maintain focus.
- **Vertical Rhythm:** Task items use a standard height of 48px to allow for touch targets while maintaining information density.
- **Breakpoints:**
  - **Mobile (<768px):** Sidebar becomes a bottom-sheet or hidden drawer. Margins reduce to 16px.
  - **Desktop (>768px):** Sidebar is persistent. Content uses a 24px gutter for clear separation between navigation and workspace.

## Elevation & Depth
This design system avoids traditional box shadows in favor of **Tonal Separation** and **1px Outlines**.

- **Level 0 (Canvas):** #FAF9F7 / #FFF8F6 - The background of the entire application.
- **Level 1 (Surfaces):** #FFFFFF - Task cards and sidebar containers. These are defined by a 1px solid border (#E6E4E0).
- **Level 2 (Active/Drag):** When a task is being dragged or hovered, apply a very soft ambient shadow (`0px 4px 12px rgba(0,0,0,0.05)`) to indicate physical lift.
- **Dividers:** Horizontal lines between task items should be #E6E4E0 with a width of 1px.

## Shapes
The shape language is **Soft** and functional. 

- **Checkboxes:** Pure circles (50% radius) to differentiate them from the square-ish task blocks.
- **Containers:** Task items and cards use a 4px (0.25rem) radius for a precise, professional look.
- **Pills:** Status badges, Pomodoro tags, and priority chips use a fully rounded "pill" shape (999px) to suggest they are interactive, clickable chips.
