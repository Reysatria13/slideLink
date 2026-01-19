# SlideLink Design System

## 1. Brand Identity & Overview

**SlideLink** is a PowerPoint translation tool designed with a "Clean Japanese Business" aesthetic. It emphasizes clarity, precision, and a structured workflow. The interface balances high-density information (slide editing) with a calm, focused workspace.

### Core Philosophy
- **Precision**: Clean lines, high contrast for active states.
- **Duality**: Clear visual distinction between "Original (Japanese)" and "Translated (English)".
- **Focus**: Minimalist interface that highlights the content (slides) rather than the chrome.

---

## 2. Color Palette

The color system is built on a strong duality between the Source (Red) and Destination (Teal), grounded by a neutral slate scale.

### Primary Colors

| Name | Hex | Tailwind Utility | Usage |
|------|-----|------------------|-------|
| **Honda Red** | `#CC0000` | `bg-[#CC0000]` / `text-[#CC0000]` | **Source Language (JP)**, Active Step, Urgent Alerts, "Original" Indicators |
| **Teal** | `#3A9A8A` | `bg-[#3A9A8A]` / `text-[#3A9A8A]` | **Target Language (EN)**, Completed Step, Save Actions, "Translated" Indicators |

### Neutral Scale (Slate)

| Name | Hex | Usage |
|------|-----|-------|
| **Background** | `#F8F9FA` / `#EEF0F2` | App backgrounds, Canvas area |
| **Surface** | `#FFFFFF` | Cards, Sidebar, Header, Modals |
| **Border** | `#E2E8F0` (Slate-200) | Dividers, Card borders |
| **Text Muted** | `#94A3B8` (Slate-400) | Inactive labels, Metadata, Placeholders |
| **Text Body** | `#64748B` (Slate-500) | Secondary text, Descriptions |
| **Text Primary** | `#1E293B` (Slate-800) | Headings, Main content, Inputs |

### Semantic Usage

- **Active State**: High contrast Red (`#CC0000`) with shadow glow.
- **Success/Done**: Solid Teal (`#3A9A8A`).
- **Selection**: Teal tint background (`bg-[#3A9A8A]/10`) with Teal border.
- **Comparison**:
  - Left (Original): Marked with Red accent.
  - Right (Translated): Marked with Teal accent.

---

## 3. Typography

The application uses a standard sans-serif stack (Inter/System) optimized for legibility at small sizes (thumbnails) and large headings.

**Font Family**: `font-sans` (Tailwind default)

### Type Scale

| Component | Size | Weight | Details |
|-----------|------|--------|---------|
| **Slide Title** | `text-4xl` | `font-bold` | Main headers within slide preview |
| **Slide Body** | `text-xl` | `font-medium` | Bullet points within slide preview |
| **UI Headings** | `text-sm` | `font-bold` | Panel headers, Button labels |
| **Metadata** | `text-xs` | `font-semibold` | Slide numbers, Status tags |
| **Tiny Labels** | `text-[10px]` | `font-bold` | Stepper labels, Technical tags |

---

## 4. Layout & Grid

The application follows a fixed-sidebar, fluid-content model.

### App Structure
- **Header**: `h-14` (approx 56px), white background, sticky.
- **Stepper Bar**: `z-40`, white background, compact height.
- **Sidebar**: Fixed width `w-[200px]`, scrollable.
- **Canvas**: `flex-1`, centralized content, overflows with scroll.

### Slide Dimensions
- **Aspect Ratio**: 16:9 (`aspect-video`)
- **Base Resolution**: `960px` x `540px` (Scaled via CSS transforms for responsiveness).
- **Scaling**: Uses `transform: scale(n)` to fit slides into thumbnails or workspace without reflowing text.

---

## 5. Component Library

### 5.1 Progress Stepper (`App.tsx`)
A linear progress indicator guiding the user through the workflow.

- **Structure**: Flex container with centered items.
- **Connector**: 1px absolute line (`bg-slate-200`) behind nodes.
- **Nodes**:
  - **Inactive**: `bg-slate-100`, `text-slate-400`.
  - **Active**: `bg-[#CC0000]`, `text-white`, `scale-110`, `shadow-lg`.
  - **Complete**: `bg-[#3A9A8A]`, `text-white`, Icon: `<Check />`.

### 5.2 Slide Workspace (`SlideWorkspace.tsx`)
The core editing environment.

- **View Modes**:
  1. **Single View**: Toggle between JP/EN tabs.
  2. **Split View (Comparison)**: Modal overlay with side-by-side slides.
- **Zoom Controls**: Floating pill menu (`bottom-6`) with +/- buttons.

### 5.3 Slide Card
The visual representation of a slide.

- **Container**: White, `rounded-xl`, `shadow-sm`.
- **Top Bar Indicator**:
  - Red (`bg-[#CC0000]`) for Original.
  - Teal (`bg-[#3A9A8A]`) for Translated.
- **Status Badge**: Top-left, `text-[10px]`, styled matching the language color.
- **Edit Mode**: When active, inputs replace text elements, styled with `focus:ring-[#3A9A8A]`.

### 5.4 Sidebar Thumbnails
- **Container**: `w-[200px]`, `border-r`.
- **Item**:
  - **Normal**: `bg-transparent`.
  - **Selected**: `bg-[#3A9A8A]/10`, `ring-1 ring-[#3A9A8A]`.
- **Miniature**: Uses CSS scaling (`scale(0.166)`) to render the full slide DOM at a tiny size, ensuring exact visual fidelity.

---

## 6. Icons & Assets

- **Library**: `lucide-react`
- **Key Icons**:
  - `Check` (Success)
  - `Columns` (Comparison View)
  - `MessageSquare` (AI Comments)
  - `Download`, `Edit3`, `Save` (Actions)
- **Styling**: Icons generally inherit text color or use specific brand colors (e.g., Red for AI alerts).

---

## 7. Interactive Behaviors

- **Transitions**: `motion/react` (`AnimatePresence`) used for:
  - Step transitions (Slide left/right).
  - Modal open/close (Scale/Fade).
  - Tab switching (Crossfade).
- **Hover Effects**: subtle `bg-slate-50` or darken transitions.
- **Focus**: Default browser outlines removed, replaced with Brand Teal rings (`ring-[#3A9A8A]`).
