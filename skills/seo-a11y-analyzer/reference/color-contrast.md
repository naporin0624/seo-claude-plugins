# Color Contrast Reference

Quick lookup table for common color combinations against white (#FFFFFF) background.

## Quick Lookup

### AAA Pass (7:1+) - Best
```
#000000 on #FFFFFF: 21.00:1  ✅✅✅
#1a1a1a on #FFFFFF: 17.40:1  ✅✅✅
#2b2b2b on #FFFFFF: 14.37:1  ✅✅✅
#333333 on #FFFFFF: 12.63:1  ✅✅✅
#4d4d4d on #FFFFFF:  9.73:1  ✅✅✅
#595959 on #FFFFFF:  7.92:1  ✅✅✅
```

### AA Pass (4.5:1+) - Normal Text Minimum
```
#666666 on #FFFFFF:  6.05:1  ✅✅
#6c6c6c on #FFFFFF:  5.91:1  ✅✅
#757575 on #FFFFFF:  4.60:1  ✅✅
#767676 on #FFFFFF:  4.54:1  ✅ (borderline)
```

### AA Fail (<4.5:1) - Use for Large Text Only
```
#808080 on #FFFFFF:  3.95:1  ⚠️ Large text only
#8c8c8c on #FFFFFF:  3.36:1  ⚠️ Large text only
#959595 on #FFFFFF:  3.08:1  ⚠️ Large text only (borderline)
#999999 on #FFFFFF:  2.85:1  ❌ Fails even large
#aaaaaa on #FFFFFF:  2.32:1  ❌
#bbbbbb on #FFFFFF:  1.87:1  ❌
#cccccc on #FFFFFF:  1.61:1  ❌
#dddddd on #FFFFFF:  1.39:1  ❌
```

## Requirements Summary

| Text Type | Minimum Ratio | Example Pass |
|-----------|---------------|--------------|
| Normal text | 4.5:1 | #767676 |
| Large text (18pt / 14pt bold+) | 3:1 | #959595 |
| UI components | 3:1 | #959595 |
| Non-text graphics | 3:1 | #959595 |

## Common Brand Colors

### Blues
```
#0000FF (pure blue) on #FFFFFF: 8.59:1  ✅✅✅
#0066CC on #FFFFFF: 5.57:1  ✅✅
#0077CC on #FFFFFF: 4.94:1  ✅✅
#0088CC on #FFFFFF: 4.38:1  ⚠️ Borderline
#007BFF (Bootstrap) on #FFFFFF: 4.50:1  ✅ (exactly)
#2196F3 (Material) on #FFFFFF: 3.26:1  ⚠️ Large only
```

### Greens
```
#008000 (green) on #FFFFFF: 5.14:1  ✅✅
#28A745 (Bootstrap) on #FFFFFF: 3.50:1  ⚠️ Large only
#4CAF50 (Material) on #FFFFFF: 2.81:1  ❌
#218838 on #FFFFFF: 4.52:1  ✅✅
```

### Reds
```
#FF0000 (red) on #FFFFFF: 3.99:1  ⚠️ Large only
#DC3545 (Bootstrap) on #FFFFFF: 4.88:1  ✅✅
#F44336 (Material) on #FFFFFF: 3.93:1  ⚠️ Large only
#C82333 on #FFFFFF: 5.91:1  ✅✅
```

### Oranges/Yellows
```
#FFA500 (orange) on #FFFFFF: 2.14:1  ❌
#FF8C00 on #FFFFFF: 2.50:1  ❌
#E65100 on #FFFFFF: 4.62:1  ✅✅
#FFFF00 (yellow) on #FFFFFF: 1.07:1  ❌
#F9A825 on #FFFFFF: 2.08:1  ❌
```

## Dark Backgrounds

### Light Text on Dark
```
#FFFFFF on #000000: 21.00:1  ✅✅✅
#FFFFFF on #1a1a1a: 17.40:1  ✅✅✅
#FFFFFF on #212121: 15.95:1  ✅✅✅
#FFFFFF on #333333: 12.63:1  ✅✅✅
#E0E0E0 on #333333:  9.60:1  ✅✅✅
#BDBDBD on #333333:  6.77:1  ✅✅
#9E9E9E on #333333:  4.72:1  ✅✅
#757575 on #333333:  2.65:1  ❌
```

## Suggested Replacements

| Failing Color | Replacement | Ratio |
|---------------|-------------|-------|
| #999999 (2.85:1) | #767676 | 4.54:1 |
| #aaaaaa (2.32:1) | #757575 | 4.60:1 |
| #bbbbbb (1.87:1) | #666666 | 6.05:1 |
| #cccccc (1.61:1) | #595959 | 7.92:1 |

## How to Use

1. Extract foreground and background colors from CSS/inline styles
2. Find closest match in tables above
3. If exact match not found → "⚠️ Requires verification"
4. For accurate calculation, use axe-core:
   ```bash
   npx @axe-core/cli file.html --tags wcag21aa
   ```

## Contrast Calculation Formula

For reference (use tools for accuracy):

1. Convert RGB to relative luminance (L):
   ```
   L = 0.2126 * R + 0.7152 * G + 0.0722 * B
   (where R, G, B are linearized values)
   ```

2. Calculate ratio:
   ```
   ratio = (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
   ```

## Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)
- Browser DevTools → Accessibility panel
- axe DevTools extension

## WCAG Reference

- **1.4.3 Contrast (Minimum)** - Level AA
- **1.4.6 Contrast (Enhanced)** - Level AAA (7:1 / 4.5:1)

## Common Mistakes

1. **Using hex without verification** - Always check actual ratio
2. **CSS variables** - Need runtime resolution to check
3. **Gradient backgrounds** - Check at multiple points
4. **Transparency** - Final color depends on what's behind
5. **High contrast mode** - Test Windows high contrast mode
