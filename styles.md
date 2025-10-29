# Privacy Checker Design System

A retro/vintage aesthetic design system with bold colors, strong borders, and uppercase typography.

---

## 🎨 Color Palette

### Core Colors (CSS Variables)
```css
--pink: #f4c2c2;      /* Soft pink accent */
--peach: #f5d5a8;     /* Warm peachy background */
--mint: #c8e6c9;      /* Success/pass state */
--sky: #b3d4e0;       /* Secondary accent */
--lavender: #d4c5f9;  /* Info/reference backgrounds */
--cream: #fef9e7;     /* Light background */
--coral: #ff6b6b;     /* Error/warning state */
--mustard: #f4a261;   /* Warning accent */
--sage: #a8dadc;      /* Success accent */
--burgundy: #6d4c41;  /* Secondary text */
--navy: #1d3557;      /* Primary text & borders */
```

### Color Usage

**Backgrounds:**
- Main sections: `var(--peach)` or `var(--cream)`
- Success boxes: `var(--mint)`
- Warning/risk boxes: `var(--coral)`
- Info boxes: `var(--lavender)`
- Dark sections: `var(--navy)`

**Text:**
- Primary: `var(--navy)`
- Secondary: `var(--burgundy)`
- Light on dark: `white` or `var(--cream)`

**Borders & Accents:**
- Primary borders: `var(--navy)` (3-4px solid)
- Left accent borders:
  - Success: `var(--mint)` or `var(--sage)` (4-8px)
  - Error: `var(--coral)` (4-8px)
  - Warning: `var(--mustard)` (4-8px)
  - Info: `var(--lavender)` or `var(--navy)` (4-8px)
- Container side borders: `var(--pink)` (left) and `var(--sky)` (right)
- Section dividers: `var(--mustard)` (4-8px)

**Status Colors:**
- Pass/Success: `var(--mint)` background, `var(--sage)` text
- Fail/Error: `var(--coral)` background/border
- Warning: `var(--mustard)` background/border

---

## ✍️ Typography

### Font Stack
```css
font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif;
```

### Heading Styles
```css
/* Main Title (H1) */
font-size: 2.5rem;
font-weight: 700;
letter-spacing: 4px;
text-transform: uppercase;
color: var(--navy);

/* Section Titles (H2) */
font-size: 1.8rem;
text-transform: uppercase;
letter-spacing: 2px;
padding-bottom: 1rem;
border-bottom: 3px solid var(--mustard) or var(--navy);

/* Subsection Titles (H3) */
font-size: 1.3rem;
text-transform: uppercase;
letter-spacing: 2px;
color: var(--navy);
padding-bottom: 0.5rem;
border-bottom: 3px solid var(--pink);

/* Component Titles (H4) */
font-size: 1.1rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1px;
color: var(--navy);
```

### Body Text
```css
/* Primary Body */
line-height: 1.6-1.8;
color: var(--navy);

/* Secondary Body */
color: var(--burgundy);
line-height: 1.8;

/* Small Text */
font-size: 0.85-0.95rem;
letter-spacing: 1px;
```

### Special Text Styles
```css
/* Labels */
text-transform: uppercase;
letter-spacing: 1px;
font-weight: 700;
font-size: 0.8-0.9rem;

/* Taglines */
letter-spacing: 2px;
font-weight: 400;
text-transform: uppercase;
```

---

## 📐 Layout Principles

### Spacing System
```css
/* Use consistent spacing multiples */
0.5rem (8px)   /* Tight spacing */
1rem (16px)    /* Standard spacing */
1.5rem (24px)  /* Medium spacing */
2rem (32px)    /* Large spacing */
3rem (48px)    /* Section spacing */
```

### Container Structure
```css
.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-left: 8px solid var(--pink);
  border-right: 8px solid var(--sky);
}

.main-content {
  padding: 3rem 2rem;
}
```

### Grid & Flexbox Patterns
```css
/* Card Grid */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 0; /* No gap for bordered grid */
border: 3px solid var(--navy);

/* Flex Row */
display: flex;
gap: 2rem;
flex-wrap: wrap;

/* Centered Content */
display: flex;
justify-content: center;
align-items: center;
text-align: center;
```

---

## 🔲 Border Philosophy

**Key Principle: Bold, visible borders everywhere**

### Border Weights
- **Heavy borders:** 4-8px (container sides, major sections)
- **Standard borders:** 3px (cards, buttons, inputs)
- **Light borders:** 2px (text underlines, subtle dividers)

### Border Patterns
```css
/* Card/Component Border */
border: 3px solid var(--navy);
border-left: 8px solid [status-color]; /* Color-coded left accent */

/* Section Divider */
border-bottom: 4px solid var(--mustard);
border-top: 8px solid var(--mustard);

/* No Rounded Corners */
border-radius: 0; /* Always use square corners for retro feel */
```

---

## 🧩 Component Patterns

### Buttons
```css
.btn {
  padding: 1rem 2rem;
  border: none; /* Border added by context */
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif;
}

.btn-primary {
  background: var(--coral);
  color: white;
  border-left: 3px solid var(--navy);
}

.btn-primary:hover {
  background: var(--mustard);
}

.btn-secondary {
  background: var(--sky);
  color: var(--navy);
  border: 3px solid var(--navy);
}

.btn-secondary:hover {
  background: var(--lavender);
}
```

### Tabs
```css
.tabs {
  display: flex;
  gap: 0;
  border: 3px solid var(--navy);
}

.tab-btn {
  background: white;
  border: none;
  border-right: 3px solid var(--navy);
  padding: 1rem 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex: 1;
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn.active {
  background: var(--pink);
  color: var(--navy);
}

.tab-btn:hover {
  background: var(--cream);
}
```

### Cards/Boxes
```css
.card {
  background: white;
  border: 3px solid var(--navy);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

/* Status-based left border */
.card-success {
  border-left: 8px solid var(--mint);
}

.card-error {
  border-left: 8px solid var(--coral);
}

.card-warning {
  border-left: 8px solid var(--mustard);
}
```

### Input Fields
```css
.input {
  padding: 1rem;
  border: 3px solid var(--navy);
  font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif;
  background: white;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  background: var(--cream);
}
```

### Info Boxes
```css
.info-box {
  background: var(--mint);
  border-left: 4px solid var(--sage);
  padding: 1.5rem;
  margin: 2rem 0;
}

.warning-box {
  background: var(--coral);
  border: 4px solid var(--navy);
  padding: 2rem;
}

.reference-box {
  background: var(--lavender);
  padding: 1rem;
  border-left: 4px solid var(--navy);
}
```

---

## 🎯 Special Elements

### Score Display
```css
.score-box {
  width: 180px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 4px solid var(--navy);
  /* Square - no border-radius */
}

.score-value {
  font-size: 4rem;
  line-height: 1;
}

.score-label {
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### Category Headers
```css
.category-title {
  font-size: 1.3rem;
  padding: 1rem;
  background: var(--navy);
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
}
```

### Priority/Status Badges
```css
.badge {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 2px solid var(--navy);
}

.priority-high {
  background: var(--coral);
  color: white;
}

.priority-medium {
  background: var(--peach);
  color: var(--navy);
}

.priority-low {
  background: var(--sky);
  color: var(--navy);
}
```

### Arrow Indicators
```css
/* Use before pseudo-elements for arrows */
.element::before {
  content: "→";
  color: var(--coral);
  font-weight: 700;
  margin-right: 0.5rem;
}
```

---

## 📱 Responsive Patterns

### Mobile Breakpoints
```css
@media (max-width: 768px) {
  /* Reduce border widths */
  .container {
    border-left-width: 4px;
    border-right-width: 4px;
  }

  /* Reduce letter-spacing */
  h1 {
    font-size: 1.8rem;
    letter-spacing: 2px;
  }

  /* Stack flex layouts */
  .flex-row {
    flex-direction: column;
  }

  /* Full width buttons */
  .btn {
    width: 100%;
  }

  /* Adjust grid */
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 🎨 Design Principles Summary

1. **Bold & Geometric:** Thick borders (3-8px), no rounded corners, strong grid alignment
2. **Retro Typography:** All caps headers, wide letter-spacing, Futura font
3. **Color as Function:** Each color has semantic meaning (mint=success, coral=error, etc.)
4. **High Contrast:** Navy text on light backgrounds, clear visual hierarchy
5. **Brutalist Simplicity:** No shadows, no gradients (except header), flat design
6. **Border-First:** Borders define structure, not whitespace
7. **Consistent Spacing:** Multiples of 0.5rem for all margins/padding
8. **Accessible:** High contrast ratios, clear visual states

---

## 🔧 CSS Reset & Base

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif;
  line-height: 1.6;
  color: var(--navy);
  background: var(--cream);
}
```

---

## 💡 Usage Tips

1. **Always use CSS variables** for colors - never hardcode hex values
2. **Uppercase everything** that's a label, heading, or button
3. **Letter-spacing is key** - use 1-4px for retro feel
4. **Borders over shadows** - create depth with border-left accent colors
5. **Square corners only** - border-radius: 0 (or omit the property)
6. **Bold typography** - font-weight: 700 for emphasis
7. **Consistent icon usage** - emoji icons (✓, ✗, ⚠, →, 📖, 🔒)
8. **Grid without gaps** - use borders to separate, not whitespace

---

## 📦 Example Component HTML + CSS

```html
<div class="check-item check-pass">
  <div class="check-header">
    <div class="check-icon">✓</div>
    <div class="check-title">Data Controller Identity</div>
    <div class="check-priority priority-high">HIGH</div>
  </div>
  <div class="check-description">Identity and contact details of data controller mentioned</div>
  <div class="gdpr-reference">
    <div class="gdpr-header">
      <span class="gdpr-label">📖 GDPR Reference:</span>
      <a href="#" class="gdpr-link">Art. 13.1.a</a>
    </div>
    <div class="gdpr-explanation">→ Requires the identity and contact details...</div>
  </div>
</div>
```

```css
.check-item {
  background: white;
  border: 3px solid var(--navy);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.check-item.check-pass {
  border-left: 8px solid var(--mint);
}

.check-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.check-icon {
  font-size: 1.5rem;
}

.check-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.check-priority {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 2px solid var(--navy);
}

.priority-high {
  background: var(--coral);
  color: white;
}

.check-description {
  color: var(--burgundy);
  line-height: 1.8;
}

.gdpr-reference {
  background: var(--lavender);
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid var(--navy);
}

.gdpr-label {
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

.gdpr-link {
  color: var(--navy);
  text-decoration: none;
  border-bottom: 2px solid var(--coral);
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  background: white;
  border: 2px solid var(--navy);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

.gdpr-link:hover {
  background: var(--pink);
  border-color: var(--coral);
}

.gdpr-explanation {
  color: var(--burgundy);
  line-height: 1.8;
  font-size: 0.95rem;
  padding-left: 1.5rem;
  position: relative;
  margin-top: 0.75rem;
}

.gdpr-explanation::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--coral);
  font-weight: 700;
}
```

---

## 🎭 Aesthetic Keywords

**Retro • Brutalist • Bold • Geometric • Flat • High-Contrast • Uppercase • Bordered • Colorful • Structured**

This design system creates a distinctive, memorable aesthetic that stands out from typical modern web design while maintaining excellent usability and accessibility.
