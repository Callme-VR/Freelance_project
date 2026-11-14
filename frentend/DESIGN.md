# DESIGN.md - CertGen Certificate Management

## 1. Identity & Purpose
CertGen is a focused administrative tool for generating, batch-processing, and exporting PDF certificates from spreadsheet rosters. The interface prioritizes clarity, error prevention, and efficient batch management over decorative flair.

## 2. Color System & Accessibility (WCAG 2.2 AA Compliant)
- **Background Base**: `#080c18` (Deep Midnight Slate)
- **Elevated Surfaces**: `#0f172a` (Card base), `#1e293b` (Card hover / input fields)
- **Borders**: `#334155` (Subtle boundary), `#475569` (Active / Hover boundary)
- **Text Primary**: `#f8fafc` (Contrast 16.5:1 - AAA PASS)
- **Text Secondary**: `#cbd5e1` (Contrast 10.8:1 - AAA PASS)
- **Text Muted / Supporting**: `#94a3b8` (Contrast 7.61:1 - AA PASS, replacing previous low-contrast `#4a5270`)
- **Brand Accent**: `#f59e0b` (Amber 500) & `#fbbf24` (Amber 400)
- **Status Semantic**:
  - Success: `#10b981` (Emerald 500)
  - Processing: `#3b82f6` (Blue 500)
  - Warning: `#f59e0b` (Amber 500)
  - Error: `#ef4444` (Rose 500)

## 3. Typography & Rhythm
- **Sans Font**: Inter, system-ui
- **Header Font**: Space Grotesk / Inter tight
- **Scales**:
  - Display / Hero Title: 32px - 40px (Bold 700, -0.02em tracking)
  - Section Headings: 20px - 24px (Semibold 600)
  - Body Text: 14px - 15px (Regular 400 / Medium 500, line-height 1.5)
  - Supporting / Captions: 12px - 13px (Medium 500)

## 4. Copywriting & Voice (Anti-Slop Filter)
- **Direct, functional, honest**: No marketing fluff, no fake metrics, no hype words ("supercharge", "lightning fast", "revolutionary").
- **Clear Action Labels**:
  - Use "Upload Excel Roster" instead of "🚀 Upload Excel File"
  - Use "Download ZIP Archive" instead of "↓ ZIP"
  - Use "Parsed Candidate Roster" instead of "Magical Preview"
- **Iconography**: Clean SVG icons (via Lucide React) instead of emojis.

## 5. Mobile & Responsive Layout
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg).
- **Table Behavior**: On screens below 768px, horizontal tables allow fluid scrolling with frozen key columns or reflow into readable candidate cards.
- **Touch Targets**: Minimum 44px height on all buttons and file upload zones.
