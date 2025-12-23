# SEO Checks Reference

Complete list of 30 SEO checks organized by priority.

## Priority 0 (Critical)

### 1. Title Tag
- **Check**: `<title>` exists and is non-empty
- **Optimal**: 50-60 characters
- **Impact**: High - appears in search results

```html
<!-- Good -->
<title>Best Running Shoes 2024 - Expert Reviews | ShoeStore</title>

<!-- Bad -->
<title></title>
<title>Home</title>
```

### 2. Meta Description
- **Check**: `<meta name="description" content="...">` exists
- **Optimal**: 150-160 characters
- **Impact**: High - appears in search results

```html
<!-- Good -->
<meta name="description" content="Compare top-rated running shoes with expert reviews. Find the perfect fit for your running style and budget. Free shipping on orders over $50.">

<!-- Bad -->
<meta name="description" content="">
<meta name="description" content="Welcome to our website">
```

### 3. H1 Tag
- **Check**: Exactly one `<h1>` per page
- **Impact**: High - primary heading for page topic

```html
<!-- Good -->
<h1>Running Shoe Buying Guide 2024</h1>

<!-- Bad: Multiple H1s -->
<h1>ShoeStore</h1>
<h1>Running Shoes</h1>
```

### 4. Canonical URL
- **Check**: `<link rel="canonical" href="...">` exists
- **Impact**: High - prevents duplicate content issues

```html
<link rel="canonical" href="https://example.com/products/running-shoes">
```

## Priority 1 (Important)

### 5. Language Attribute
- **Check**: `<html lang="xx">` exists
- **Impact**: Medium - helps search engines understand content language

```html
<html lang="en">
<html lang="ja">
```

### 6. Viewport Meta
- **Check**: `<meta name="viewport" content="...">` exists
- **Impact**: High - mobile-friendliness signal

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 7. Heading Hierarchy
- **Check**: No skipped levels (h1 → h2 → h3)
- **Impact**: Medium - document structure

```html
<!-- Good -->
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- Bad: Skipped h2 -->
<h1>Main Title</h1>
<h3>Subsection</h3>
```

### 8. Image Alt Text
- **Check**: All `<img>` have `alt` attribute
- **Impact**: High - image search, accessibility

```html
<img src="product.jpg" alt="Nike Air Max 90 running shoes in black">
```

### 9. Internal Links
- **Check**: Key pages have internal links
- **Impact**: Medium - page discovery, link equity

### 10. External Links
- **Check**: Outbound links use `rel="noopener"` for `target="_blank"`
- **Impact**: Low - security best practice

```html
<a href="https://external.com" target="_blank" rel="noopener">Link</a>
```

## Priority 2 (Recommended)

### 11. Open Graph Tags
- **Check**: `og:title`, `og:description`, `og:image`, `og:url` exist
- **Impact**: Medium - social media sharing

```html
<meta property="og:title" content="Running Shoe Guide 2024">
<meta property="og:description" content="Find the perfect running shoes...">
<meta property="og:image" content="https://example.com/images/og-image.jpg">
<meta property="og:url" content="https://example.com/running-shoes">
<meta property="og:type" content="article">
```

### 12. Twitter Cards
- **Check**: `twitter:card`, `twitter:title`, `twitter:description` exist
- **Impact**: Medium - Twitter sharing

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Running Shoe Guide 2024">
<meta name="twitter:description" content="Find the perfect running shoes...">
<meta name="twitter:image" content="https://example.com/images/twitter-image.jpg">
```

### 13. Structured Data
- **Check**: Valid JSON-LD exists for page type
- **Impact**: High - rich snippets in search results

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nike Air Max 90",
  "description": "Classic running shoes...",
  "image": "https://example.com/airmax.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Nike"
  }
}
</script>
```

### 14. Robots Meta
- **Check**: Appropriate `robots` meta or X-Robots-Tag
- **Impact**: High - controls indexing

```html
<!-- Default (index, follow) - usually no tag needed -->

<!-- Prevent indexing -->
<meta name="robots" content="noindex, nofollow">

<!-- Prevent snippet -->
<meta name="robots" content="nosnippet">
```

### 15. URL Structure
- **Check**: URLs are descriptive and clean
- **Impact**: Medium - user experience, click-through

```
Good: /products/running-shoes/nike-air-max
Bad:  /p?id=12345&cat=3
```

## Priority 3 (Nice to Have)

### 16. XML Sitemap Reference
- **Check**: Sitemap mentioned or linked
- **Impact**: Low - helps crawlers

### 17. Robots.txt Reference
- **Check**: robots.txt exists and is valid
- **Impact**: Low - crawler guidance

### 18. HTTPS
- **Check**: Page uses HTTPS
- **Impact**: High - ranking signal, security

### 19. Page Speed Hints
- **Check**: No blocking scripts in `<head>`
- **Impact**: Medium - performance

```html
<!-- Good: Defer non-critical scripts -->
<script src="analytics.js" defer></script>

<!-- Bad: Blocking script -->
<script src="analytics.js"></script>
```

### 20. Image Optimization
- **Check**: Images have `width` and `height` attributes
- **Impact**: Medium - prevents layout shift

```html
<img src="photo.jpg" alt="..." width="800" height="600">
```

### 21. Lazy Loading
- **Check**: Off-screen images use `loading="lazy"`
- **Impact**: Low - performance

```html
<img src="below-fold.jpg" alt="..." loading="lazy">
```

### 22. Preconnect/Preload
- **Check**: Critical resources preloaded
- **Impact**: Medium - performance

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" href="critical.css" as="style">
```

### 23. Favicon
- **Check**: Favicon exists and is linked
- **Impact**: Low - branding

```html
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### 24. 404 Page
- **Check**: Custom 404 page exists
- **Impact**: Low - user experience

### 25. Breadcrumbs
- **Check**: Breadcrumb navigation with structured data
- **Impact**: Medium - navigation, rich snippets

### 26. Pagination
- **Check**: `rel="prev"` and `rel="next"` for paginated content
- **Impact**: Low - crawler guidance

```html
<link rel="prev" href="/articles?page=1">
<link rel="next" href="/articles?page=3">
```

### 27. Hreflang
- **Check**: `hreflang` for multilingual sites
- **Impact**: High for international - correct language targeting

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="ja" href="https://example.com/ja/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

### 28. Content Length
- **Check**: Main content has sufficient text
- **Impact**: Medium - thin content issues

**Guideline**: 300+ words for main content pages

### 29. Keyword Usage
- **Check**: Target keyword in title, H1, first paragraph
- **Impact**: Medium - relevance signal

### 30. Mobile Usability
- **Check**: Touch targets are adequately sized
- **Impact**: High - mobile-first indexing

**Guideline**: Tap targets at least 48x48 pixels

## Summary Checklist

```
Critical (P0):
- [ ] Title tag (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Single H1 tag
- [ ] Canonical URL

Important (P1):
- [ ] Language attribute
- [ ] Viewport meta
- [ ] Heading hierarchy
- [ ] Image alt text
- [ ] Internal linking

Recommended (P2):
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Structured data (JSON-LD)
- [ ] Robots meta (if needed)

Nice to Have (P3):
- [ ] XML sitemap
- [ ] HTTPS
- [ ] Performance optimizations
- [ ] Favicon
- [ ] Breadcrumbs
```
