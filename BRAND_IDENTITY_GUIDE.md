# LearnSkart Brand Identity Guidelines

## Visual Brand Standards

### Primary Logo Font
```
Font Family:  Poppins
Font Weight:  700 (Bold)
Font Size:    24px
Letter Spacing: -0.5px (optional)
Text Transform: None (Sentence case: "LearnSkart")
```

### Primary Brand Color
```
Color Name:  Sky Blue
Hex Code:    #3b82f6
RGB:         rgb(59, 130, 246)
HSLA:        hsl(217°, 92%, 60%)
CSS Variable: var(--primary)
```

### Color Palette
```
Primary Blue:       #3b82f6 (Main logo)
Primary Light:      #eff6ff (Backgrounds)
Primary Hover:      #2563eb (Interactions)
Dark Mode Light:    #60a5fa (Dark backgrounds)
Secondary:          #ec4899 (Accents)
Accent:             #10b981 (Success states)
```

### Logo Specifications
```
Min Size:     24px (Readable minimum)
Standard:     48px (Icon size)
Large:        64px+ (Hero sections)
Aspect Ratio: Content-aware
Padding:      8px minimum around logo
```

### Typography Stack
```
Primary Font:    Poppins (Brand, Headers)
Secondary Font:  Inter (Body text)
Fallback:        sans-serif

Import: @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap');
```

---

## Dark Mode Colors

```
Background:     #0f1419, #111827, #1f2937
Card:          #1a202c
Logo Color:    #60a5fa (Light blue)
Text:          #e2e8f0, #f1f5f9 (Light gray)
Border:        #2d3748, #333333
```

---

## Implementation Checklist

- [x] Font Family: Poppins for all logos/headers
- [x] Font Size: 24px for primary logo
- [x] Font Weight: 700 (Bold)
- [x] Color: #3b82f6 for all brand elements
- [x] Favicon: SVG format for scalability
- [x] Apple Touch Icon: 180x180px PNG
- [x] Web Manifest: site.webmanifest included
- [x] Dark Mode Support: Variant colors applied
- [x] Responsive: Scales properly on all devices
- [x] Accessibility: Sufficient color contrast (WCAG AA)

---

## Files Using Brand Styling

### Home Section
- Home/index.html (uses style.css)

### Department Pages
- Dept/civil.html, cse.html, ece.html, eee.html, it.html, mech.html (uses Deptstyle.css)

### Content Pages
- syllabus/syllabus.html, sypdf.html
- question paper/question.html
- pdfs/pdfs.html, pdfs/demo.html

### Legal Pages
- calculator.html
- privacy.html
- disclaimer.html

---

## Usage Examples

### HTML Logo Implementation
```html
<div class="logo">
    <img src="favicon (2)/favicon-96x96.png" alt="LearnSkart Logo" class="logo-img">
    LearnSkart
</div>
```

### CSS Logo Styling
```css
.logo {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #3b82f6;
    display: flex;
    align-items: center;
    gap: 8px;
}
```

### Favicon Links
```html
<link rel="icon" type="image/svg+xml" href="favicon (2)/favicon.svg">
<link rel="apple-touch-icon" href="favicon (2)/apple-touch-icon.png">
<link rel="manifest" href="favicon (2)/site.webmanifest">
```

---

## Brand Colors in Context

### Primary Contexts
- Logo text: #3b82f6
- Navigation highlights: #3b82f6
- Active buttons: #3b82f6
- Links: #3b82f6
- Icons: #3b82f6

### Secondary Contexts
- Hover states: #2563eb (Darker)
- Light backgrounds: #eff6ff
- Dark mode: #60a5fa (Lighter)

---

## Accessibility Standards

✅ WCAG AA Compliant  
✅ Contrast Ratio: 4.5:1 (text on white)  
✅ Font size minimum: 24px  
✅ Clear, readable font: Poppins  

---

## Browser Support

✅ Poppins Font:     All modern browsers + IE 11  
✅ SVG Favicon:       Chrome 35+, Firefox 41+, Safari 9+  
✅ CSS Variables:     Chrome 49+, Firefox 31+, Safari 9.1+  
✅ Web Manifest:      Chrome 39+, Firefox 48+, Safari 15.1+  

---

## Brand Voice & Tone

**Professional**  
**Modern**  
**Accessible**  
**Student-Friendly**  
**Educational**

---

**Last Updated**: January 24, 2026  
**Version**: 1.0  
**Status**: Active  
