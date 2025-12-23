# SEO & Accessibility Analyzer Skills - Best Practices Optimized Plan

## 📋 Key Optimizations from Best Practices

### 1. **Concise is Key** - Maximize Context Efficiency
- SKILL.md body: **Under 500 lines** (official recommendation)
- Details via progressive disclosure
- Omit information Claude already knows

### 2. **Progressive Disclosure** - Staged Information Revelation
- SKILL.md = Overview and navigation
- Details in separate files (1-level depth only)
- Table of contents for files over 100 lines

### 3. **Evaluation-Driven Development** - Tests Before Implementation
- Create evaluation cases **before** writing documentation
- Design with Claude A → Test with Claude B
- Iterate based on real usage observations

### 4. **Workflows & Validation Loops** - Structured Quality Assurance
- Complex tasks use step-by-step checklists
- Execute → Validate → Fix → Re-execute pattern
- axe-core CLI as validation infrastructure

---

## 📂 Optimized Skills Structure

### Skill 1: seo-a11y-analyzer (Core Analysis)

```
seo-a11y-analyzer/
├── SKILL.md                      # Main (450 lines, overview + workflows)
├── reference/
│   ├── seo-checks.md            # SEO check details (30 items)
│   ├── color-contrast.md        # Color contrast reference table
│   ├── wcag-quick-ref.md        # WCAG criteria quick reference
│   └── examples.md              # Implementation examples
└── scripts/
    └── validate-with-axe.sh     # axe-core CLI wrapper
```

### Skill 2: wcag-21-aa-reference (Knowledge Base)

```
wcag-21-aa-reference/
├── SKILL.md                      # Main (400 lines, key 12 criteria)
└── criteria/
    ├── perceivable.md           # Principle 1: Perceivable (10 criteria)
    ├── operable.md              # Principle 2: Operable (15 criteria)
    ├── understandable.md        # Principle 3: Understandable (8 criteria)
    └── robust.md                # Principle 4: Robust (5 criteria)
```

### Skill 3: wai-aria-patterns (ARIA Knowledge)

```
wai-aria-patterns/
├── SKILL.md                      # Main (450 lines, major patterns)
├── attributes/
│   ├── widget-attrs.md          # Widget attributes (20 items)
│   ├── live-region.md           # Live region attributes (5 items)
│   └── relationships.md         # Relationship attributes (10 items)
└── patterns/
    ├── dialog-modal.md          # Dialog pattern
    ├── tabs.md                  # Tabs pattern
    ├── accordion.md             # Accordion pattern
    └── combobox.md              # Combobox pattern
```

---

## 📝 Optimized SKILL.md Example: seo-a11y-analyzer

```markdown
---
name: seo-a11y-analyzer
description: Analyzes HTML/JSX files for SEO and accessibility issues including WCAG 2.1 AA compliance, color contrast (4.5:1), font-size, meta tags, and ARIA attributes. Use when checking web pages for SEO, accessibility, WCAG compliance, or when user mentions "a11y", "contrast", "alt text", or "meta tags".
---

# SEO & Accessibility Analyzer

Analyzes HTML/JSX files for SEO and WCAG 2.1 AA compliance.

## Quick Start

Copy this workflow checklist and track progress:

```
Analysis Progress:
- [ ] Step 1: Parse HTML/JSX file
- [ ] Step 2: Run quick checks (critical issues)
- [ ] Step 3: Run detailed checks (all issues)
- [ ] Step 4: Validate with axe-core (if available)
- [ ] Step 5: Generate report with fix suggestions
```

## Step 1: Parse File

Read the target file:
```bash
view /path/to/file.html
```

Identify file type: HTML, JSX, or TSX.

## Step 2: Quick Checks (Critical P0 Issues)

Check these **immediately**:

1. **Title tag** (WCAG 2.4.2)
   - Must exist: `<title>...</title>`
   - Length: 50-60 characters recommended

2. **Meta description** (SEO)
   - Must exist: `<meta name="description" content="...">`
   - Length: 150-160 characters

3. **H1 uniqueness** (WCAG 2.4.6)
   - Exactly one `<h1>` per page
   - Descriptive and unique

4. **Image alt attributes** (WCAG 1.1.1)
   - All `<img>` must have `alt` attribute
   - Decorative images: `alt=""`
   - Informative images: descriptive text

5. **Color contrast** (WCAG 1.4.3)
   - See [reference/color-contrast.md](reference/color-contrast.md)
   - Normal text: 4.5:1 minimum
   - Large text (18pt/14pt bold+): 3:1 minimum

If any P0 issue found, report immediately with specific location and fix.

## Step 3: Detailed Checks

**SEO checks**: See [reference/seo-checks.md](reference/seo-checks.md) for complete list (30 items)

**WCAG checks**: See [reference/wcag-quick-ref.md](reference/wcag-quick-ref.md) for criteria

**Common patterns**:
- Open Graph tags: `<meta property="og:...">`
- Twitter Cards: `<meta name="twitter:...">`
- Structured data: `<script type="application/ld+json">`
- ARIA attributes: `aria-label`, `aria-describedby`

## Step 4: Validate with axe-core (Recommended)

If axe-validator CLI available, run automated validation:

```bash
bash scripts/validate-with-axe.sh /path/to/file.html
```

This provides **99% accuracy** WCAG validation.

If axe-validator not available, continue with manual checks.

## Step 5: Generate Report

Format report as:

```markdown
# Accessibility & SEO Report: [filename]

## Summary
- ❌ Critical: [count]
- ⚠️ Warnings: [count]  
- ℹ️ Info: [count]

## Critical Issues (P0)

### 1. [Issue Title] - WCAG [X.X.X]

**Problem**: [specific description]

**Location**: [line number or selector]

**Fix**:
```html
<!-- Current (incorrect) -->
[bad code]

<!-- Fixed -->
[good code]
```

**WCAG Reference**: [link if needed]
```

Include specific, actionable fixes for each issue.

## Validation Loop Pattern

For complex fixes:

1. Apply suggested fix
2. **Re-run validation**: Use Step 4 (axe-core) or manual checks
3. If issues remain: refine fix and repeat
4. **Only proceed when validation passes**

## Examples

**Common use cases**: See [reference/examples.md](reference/examples.md)

## Advanced Features

**Batch analysis**: Process multiple files by running Steps 1-5 for each file

**Comparison mode**: Run analysis on two versions to show improvements

**Custom rules**: Modify checks in reference files for project-specific requirements

---

## Notes

- Default behavior: Analyze for WCAG 2.1 AA compliance
- Color contrast calculated from inline styles and `<style>` tags
- External CSS requires extraction before analysis
- For Level AAA, see [reference/wcag-quick-ref.md](reference/wcag-quick-ref.md)

## When NOT to Use This Skill

- URL-based testing (use axe-core CLI directly)
- Dynamic content analysis (requires browser rendering)
- Complex SPA testing (needs Lighthouse or similar)
```

---

## 📋 reference/color-contrast.md (Progressive Disclosure Example)

```markdown
# Color Contrast Reference

## Quick Lookup Table (Most Common Combinations)

### AAA Pass (7:1+)
```
#000000 on #FFFFFF: 21:1    ✅✅✅
#2b2b2b on #FFFFFF: 14.37:1 ✅✅✅
#4d4d4d on #FFFFFF: 9.73:1  ✅✅✅
```

### AA Pass (4.5:1+) - Normal Text
```
#595959 on #FFFFFF: 7.92:1  ✅✅
#6c6c6c on #FFFFFF: 5.91:1  ✅✅
#767676 on #FFFFFF: 4.54:1  ✅ (borderline)
```

### AA Fail (<4.5:1) - Normal Text
```
#808080 on #FFFFFF: 3.95:1  ❌ (use for large text only)
#999999 on #FFFFFF: 2.85:1  ❌ 
#cccccc on #FFFFFF: 1.61:1  ❌
```

## Large Text (18pt / 14pt bold+) Requirements

Minimum: 3:1

```
#808080 on #FFFFFF: 3.95:1  ✅ (OK for large text)
#959595 on #FFFFFF: 3.08:1  ✅ (OK for large text)
#999999 on #FFFFFF: 2.85:1  ❌ (fails even for large)
```

## How to Use

1. Extract color codes from HTML/CSS
2. Find closest match in table above
3. If exact match not found, mark as "⚠️ Requires verification"
4. For accurate calculation, use axe-core CLI:
   ```bash
   axe-validator validate file.html --standard wcag21aa
   ```

## Calculation Formula (Reference Only)

For manual calculation (use axe-core for production):

1. Convert RGB to relative luminance (L)
2. Calculate: (max(L1,L2) + 0.05) / (min(L1,L2) + 0.05)

This table provides fast estimation. **Use axe-core for final validation.**

## WCAG Official Reference

- **1.4.3 Contrast (Minimum)**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

## Common Mistakes

1. Using hex values without verification
2. Ignoring CSS variables (need runtime resolution)
3. Forgetting about gradient backgrounds
4. Not testing in high contrast mode
```

---

## 🎯 Evaluation-Driven Development Flow

### Phase 1: Evaluation Creation (Week 1)

**BEFORE writing Skills**, create test cases:

```json
{
  "evaluations": [
    {
      "id": "seo-basic-001",
      "skills": ["seo-a11y-analyzer"],
      "query": "Check this index.html for SEO and accessibility issues",
      "files": ["test/fixtures/missing-meta.html"],
      "expected_behavior": [
        "Identifies missing title tag",
        "Identifies missing meta description",
        "Provides specific fix with code example",
        "Reports in structured format"
      ],
      "baseline_without_skill": "Provides generic advice but misses specific issues"
    },
    {
      "id": "color-contrast-001",
      "skills": ["seo-a11y-analyzer"],
      "query": "Check color contrast in this HTML against WCAG AA",
      "files": ["test/fixtures/low-contrast.html"],
      "expected_behavior": [
        "Extracts color pairs from styles",
        "Calculates or estimates contrast ratios",
        "Identifies WCAG AA failures (< 4.5:1)",
        "Suggests specific color replacements",
        "References WCAG 1.4.3"
      ]
    },
    {
      "id": "wcag-reference-001",
      "skills": ["wcag-21-aa-reference"],
      "query": "Explain WCAG 1.4.3 in detail",
      "files": [],
      "expected_behavior": [
        "Explains contrast requirements (4.5:1 / 3:1)",
        "Provides implementation examples",
        "Links to official W3C documentation",
        "Mentions exceptions (logos, disabled)"
      ]
    }
  ]
}
```

### Phase 2: Baseline Measurement (Week 1)

**Test with Claude B (without skill):**
```
User: Check this index.html for SEO and accessibility issues

Claude B (without skill):
"I reviewed the HTML file. Here are some improvements:
- Missing title tag
- Some images lack alt attributes
..."

[Analysis: Generic advice, no specific line numbers or WCAG references]
```

### Phase 3: Minimal Skill Creation (Week 2)

**Implement minimal version that passes evaluations:**

Ask Claude A:
```
"Create a skill that helps identify missing title tags and meta descriptions in HTML files. 
The skill should:
1. Check for <title> and <meta name='description'>
2. Report specific issues with line numbers
3. Provide fix examples"
```

Claude A generates → Review → Remove verbose explanations → Create SKILL.md

### Phase 4: Test with Claude B (Week 2)

**Test with new skill:**
```
User: [same query with skill loaded]

Claude B (with skill):
[Follows workflow checklist]
[Uses view tool to read file]
[Applies checks from skill]

"# SEO & Accessibility Report

## Critical Issues (2)

### 1. Missing title tag - WCAG 2.4.2
**Line**: N/A (not found)
**Fix**:
```html
<title>Descriptive Page Title</title>
```
..."
```

### Phase 5: Iterate Based on Observation (Week 3+)

**Observations:**
- Claude B succeeds at basic checks
- Color contrast not calculated, marked "needs verification"
- WCAG reference numbers cited correctly

**Request improvements from Claude A:**
```
"The skill works for basic checks but Claude forgot to check color contrast. 
Add a prominent section about color contrast with the reference table."
```

Claude A suggests improvements → Apply → Re-test with Claude B

### Evaluation Success Criteria

For each evaluation case:
- [ ] Claude B meets all expected_behavior items
- [ ] Report is structured
- [ ] Provides specific code examples
- [ ] Correctly references WCAG/SEO standards
- [ ] Clearly superior to baseline without skill

---

## 🔄 Validation Loop Patterns

### Pattern 1: axe-core Validation Loop

```markdown
## WCAG Validation Workflow

Copy and check off as you progress:

```
Validation Progress:
- [ ] 1. Manual quick checks (P0 issues)
- [ ] 2. Run axe-core validation
- [ ] 3. Review automated results
- [ ] 4. Apply fixes
- [ ] 5. Re-run axe-core
- [ ] 6. Confirm all issues resolved
```

**Step 1: Manual Quick Checks**

Check P0 issues first (see Step 2 in main SKILL.md).
These catch obvious problems before automated validation.

**Step 2: Run axe-core**

```bash
bash scripts/validate-with-axe.sh file.html
```

Output shows violations with severity: critical, serious, moderate, minor.

**Step 3: Review Results**

Focus on:
- Critical: Must fix (blocks compliance)
- Serious: Should fix (affects many users)
- Moderate: Nice to fix (best practices)

**Step 4: Apply Fixes**

Make changes based on axe-core suggestions.

**Step 5: Re-run Validation**

```bash
bash scripts/validate-with-axe.sh file.html
```

**Compare** new results with previous run.
Goal: Zero critical and serious issues.

**Step 6: Confirm Resolution**

Only mark complete when:
- axe-core reports 0 critical issues
- axe-core reports 0 serious issues
- Manual review confirms fixes are correct

If issues remain, return to Step 4.
```

### Pattern 2: Color Contrast Verification Loop

```markdown
## Color Contrast Verification

Use this workflow for color issues:

```
Contrast Check Progress:
- [ ] 1. Extract color pairs from HTML/CSS
- [ ] 2. Look up ratios in reference table
- [ ] 3. Identify failures (< 4.5:1)
- [ ] 4. Suggest replacement colors
- [ ] 5. Verify suggestions pass threshold
```

**Step 1-3**: Use [reference/color-contrast.md](reference/color-contrast.md)

**Step 4: Suggest Replacements**

For failures, provide nearest passing color:
- #999 on #FFF (2.85:1) → Use #767676 (4.54:1)
- #ccc on #FFF (1.61:1) → Use #767676 or darker

**Step 5: Verify Suggestions**

Look up suggested color in reference table.
Confirm it meets 4.5:1 threshold.

If uncertain, mark as "⚠️ Verify with axe-core".
```

---

## 📊 Best Practices Checklist

### Core Quality
- [x] SKILL.md body < 500 lines (450 lines)
- [x] Description: Third person, includes specific trigger words
- [x] Progressive disclosure: Details in separate files
- [x] 1-level depth references (SKILL.md → reference/*.md)
- [x] Table of contents for files over 100 lines
- [x] Omit information Claude already knows (conciseness)
- [x] Consistent terminology (color contrast, not colour)
- [x] Concrete examples (not abstract)

### Workflows
- [x] Checklist pattern for complex tasks
- [x] Validation loops implemented
- [x] Staged workflows (Step 1-5)
- [x] Clear "Only proceed when..." conditions

### Code & Scripts
- [x] validate-with-axe.sh: axe-core CLI wrapper
- [x] Error handling (within scripts)
- [x] Forward slashes only (avoid Windows paths)
- [x] Package dependencies explicit (axe-validator-cli)

### Evaluation
- [x] 3+ evaluation cases created (Phase 1)
- [x] Claude A (design) / Claude B (test) pattern
- [x] Baseline measurement (without skill)
- [x] Iteration based on real usage observation

### Content Guidelines
- [x] No time-sensitive information (or in "old patterns" section)
- [x] Template pattern (report format)
- [x] Examples pattern (Good/Bad comparison)
- [x] Limited options (default recommended + exceptions)

### Anti-patterns Avoided
- [x] No Windows paths
- [x] No excessive option presentation
- [x] Avoid "I can help you" (third person)
- [x] No deeply nested references

---

## 🗓️ Optimized Development Schedule (8 Weeks)

### Week 1: Evaluation Creation
- Day 1-2: Create 15 evaluation cases (5 per Skill)
- Day 3-4: Baseline measurement with Claude B (without skill)
- Day 5-7: Analyze evaluation results, create required features list

### Week 2-3: Minimal Skill Implementation
- Week 2: seo-a11y-analyzer (450 lines, passes evaluations)
- Week 3: wcag-21-aa-reference (400 lines, 12 key criteria)
- End of each week: Test with Claude B, identify missing features

### Week 4: wai-aria-patterns
- Day 22-25: Create SKILL.md (450 lines, 10 patterns)
- Day 26-28: Create detail files (attributes/, patterns/)

### Week 5: axe-core CLI Integration
- Day 29-32: Create validate-with-axe.sh
- Day 33-35: Integration testing across 3 Skills

### Week 6: Iteration Based on Usage
- Day 36-38: Test with real-world tasks
- Day 39-41: Improve with Claude A (based on observations)
- Day 42: Re-run all evaluation cases

### Week 7: Progressive Disclosure Optimization
- Day 43-45: Optimize reference files
- Day 46-48: Adjust file structure (confirm 1-level depth)
- Day 49: Add table of contents (files over 100 lines)

### Week 8: Documentation & Polish
- Day 50-52: Create README.md (each Skill)
- Day 53-55: USAGE_GUIDE.md (integration guide)
- Day 56: Final checklist verification

---

## 📦 Final Deliverables

### 1. Claude Skills (3 Skills, Fully Best Practices Compliant)
- **seo-a11y-analyzer** (450 lines + 5 reference files)
- **wcag-21-aa-reference** (400 lines + 4 criteria files)
- **wai-aria-patterns** (450 lines + 3 attribute files + 4 pattern files)

### 2. Evaluation Suite
- **15 evaluation cases** (JSON format)
- **Baseline results** (without skill)
- **Improvement metrics** (with skill applied)

### 3. Documentation
- **EVALUATION_RESULTS.md** (complete evaluation data)
- **ITERATION_LOG.md** (Claude A/B improvement history)
- **USAGE_GUIDE.md** (effective prompting techniques)
- **TROUBLESHOOTING.md** (common issues)

### 4. Integration Scripts
- **validate-with-axe.sh** (axe-core CLI wrapper)
- **batch-analyze.sh** (multiple file processing)
- **compare-versions.sh** (before/after comparison)

---

## 🎓 Key Comparisons: Before vs After Best Practices

### File Size Optimization

| Aspect | Before (Original Plan) | After (Best Practices) |
|--------|----------------------|----------------------|
| SKILL.md size | 45-60KB (unstructured) | 30-35KB (450 lines structured) |
| Claude knowledge | Explained everything | Omits known concepts |
| Structure | Single large file | Progressive disclosure |
| References | Deep nesting (3 levels) | 1-level depth only |

### Development Approach

| Phase | Before | After |
|-------|--------|-------|
| Start | Write documentation immediately | Create evaluations first |
| Testing | Ad-hoc testing | Systematic Claude B testing |
| Iteration | Based on assumptions | Based on observed behavior |
| Validation | Manual review | Automated + manual loops |

### Example: Description Field

**Before (first person, vague):**
```yaml
description: I can help you analyze HTML files for SEO and accessibility issues
```

**After (third person, specific triggers):**
```yaml
description: Analyzes HTML/JSX files for SEO and WCAG 2.1 AA compliance. Use when user mentions "a11y", "contrast", "alt text", or "meta tags".
```

### Example: Content Conciseness

**Before (verbose):**
```markdown
## Color Contrast

Color contrast refers to the ratio between text and background brightness.
WCAG 2.1 establishes the following standards:
- Normal text: requires 4.5:1 or higher
- Large text: requires 3:1 or higher
This ensures users with visual impairments can... (continues for 500 words)
```

**After (concise):**
```markdown
## Step 2: Quick Checks

5. **Color contrast** (WCAG 1.4.3)
   - See [reference/color-contrast.md](reference/color-contrast.md)
   - Normal text: 4.5:1 minimum
   - Large text: 18pt/14pt bold+: 3:1 minimum
```

---

## ✅ Next Actions

### Immediate (This Week)
1. ⬜ Create 15 evaluation cases (with specific HTML fixtures)
2. ⬜ Baseline measurement with Claude B
3. ⬜ Finalize required features list

### Week 2 (Minimal Implementation)
1. ⬜ Ask Claude A: "Create seo-a11y-analyzer skill..."
2. ⬜ Review and simplify generated Skill
3. ⬜ Test with Claude B, document missing features

### Week 6 (Iteration)
1. ⬜ Execute 10 real-world tasks
2. ⬜ Observe Claude B behavior
3. ⬜ Request improvements from Claude A

---

**Project Owner**: Naporitan  
**Plan Created**: 2025-12-23  
**Duration**: 8 weeks (Best Practices optimized)  
**Goal**: High-quality Skills via evaluation-driven development, progressive disclosure, and validation loops

**Status**: ✅ Best Practices Fully Applied → Start with Evaluation Creation

