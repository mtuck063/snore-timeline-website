# Snore Timeline - Marketing Website

## Project Overview

This is the official marketing website for **Snore Timeline**, an iOS app that helps users track and visualize nighttime breathing and snoring patterns through an interactive timeline interface. The website is designed to showcase the app's features, build trust with potential users, and drive App Store downloads.

**Live URL**: https://snoretimeline.com
**App Store ID**: 6751759381
**Primary Goal**: Convert visitors to app downloads
**Target Audience**: People concerned about snoring, sleep apnea, or sleep quality

## Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks or build tools
- **Vanilla JS** - Modern ES6+ JavaScript
- **CSS Custom Properties** - For theming and design tokens
- **SEO Optimized** - Schema.org structured data, Open Graph, Twitter Cards
- **Privacy-First** - No analytics or tracking

## File Structure

```
/
├── index.html              # Main landing page
├── privacy.html            # Privacy policy page
├── 404.html                # Custom 404 error page
├── styles.css              # All styles (design system + components)
├── script.js               # Interactive features and animations
├── README.md               # Project documentation
├── claude.md               # AI assistant context file (excluded from site)
├── _config.yml             # Jekyll config - excludes files from published site
├── CNAME                   # Domain configuration for GitHub Pages
├── robots.txt              # SEO crawling rules
├── sitemap.xml             # SEO sitemap
│
├── logo.svg                # App logo (vector)
├── logo.png                # App logo (raster)
├── favicon.ico             # Browser favicon
├── favicon-16x16.png       # Small favicon
├── favicon-32x32.png       # Medium favicon
│
├── app-screenshot.png      # Hero screenshot (PNG) - used in OG/Twitter meta tags
├── app-screenshot.webp     # Hero screenshot (WebP) - not currently used
├── breathing-screenshot.png    # Breathing disruption feature (PNG)
├── breathing-screenshot.webp   # Breathing disruption feature (WebP)
├── hero-recording.mp4      # Hero section video demo
└── hero-poster.webp        # First frame of hero video - used as video poster (68KB)
```

## Design System

### Color Palette

```css
--color-primary: #5B7FFF        /* Primary blue - CTAs, highlights */
--color-primary-dark: #4A6AE5   /* Darker blue - hover states */
--color-secondary: #FF6B9D      /* Accent pink - gradients, highlights */
--color-bg: #0F1419             /* Dark background */
--color-bg-light: #1A1F2E       /* Light background - cards, sections */
--color-text: #E8EAED           /* Primary text color */
--color-text-secondary: #9AA0A6 /* Secondary text - descriptions */
--color-border: #2D3748         /* Borders and dividers */
```

### Spacing System

Uses `clamp()` for responsive spacing:
- `--spacing-xs`: 0.25rem - 0.5rem
- `--spacing-sm`: 0.5rem - 1rem
- `--spacing-md`: 1rem - 2rem
- `--spacing-lg`: 2rem - 4rem
- `--spacing-xl`: 3rem - 6rem

### Border Radius

- `--radius`: 16px (default)
- `--radius-md`: 12px (small elements)
- `--radius-lg`: 24px (large cards)
- `--radius-xl`: 32px (hero elements)

### Shadows

- `--shadow`: Standard card shadow
- `--shadow-lg`: Elevated elements
- `--shadow-3d`: Deep 3D effects

### Typography

**Font Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

## Page Sections

### 1. Header/Navigation
- Sticky glassmorphic header with blur effect
- Logo + App name on left
- Download button on right
- Scroll-activated background opacity increase

### 2. Hero Section
- **Left**: Text content with primary CTA
- **Right**: Phone mockup with video demo
- Video file: `hero-recording.mp4` (autoplay, muted, loop)
- Primary conversion point

### 3. Features Section (6 Cards)
1. Start Your Day - Interactive timeline visualization
2. See What Happened - AI-powered detection
3. Review Episodes - Grouped snoring metrics
4. Hear It Yourself - Audio playback with enhancement
5. Track Your Progress - Weekly comparisons & export
6. Your Data, Your Device - Privacy emphasis

**Display**: Static cards (no animations) for immediate visibility

### 4. Breathing Disruption Section
- Split layout: Screenshot (left) + How it Works (right)
- 4-step detection methodology
- Key differentiator from competitors
- Uses both PNG and WebP images for performance
- Animated detection steps with staggered entrance
- **Important**: This detects breathing pauses via audio analysis only—NOT sleep apnea diagnosis

### 5. Testimonials
- Grid layout with 4 testimonial cards + 1 illustration
- Sources: Reddit (r/snoring, r/sleep) + App Store review
- SVG icons for each source
- Animated SVG illustration with moon/stars/waves
- Testimonial cards have staggered scale + fade entrance

### 6. FAQ Section
- 10 common questions with detailed answers
- Topics: Privacy, accuracy, device compatibility, battery, placement
- Special formatting for file path locations
- Static display (no animations) for immediate readability

### 7. Contact Section
- Email contact with obfuscation (anti-spam)
- Email constructed client-side: `meneliktucker@gmail.com`
- Subject line: "Snore Timeline Inquiry"

### 8. Download Section (CTA)
- Final conversion point before footer
- Emphasizes "Free" and "No subscription"
- App Store download button with tracking

### 9. Footer
- Privacy Policy link
- Minimal design

### 10. Custom 404 Page
- Matches main site design and branding
- Sleeping moon illustration with "Zzz" animation
- Large gradient "404" error code
- Friendly messaging: "This Page is Snoozing"
- Two CTA buttons: "Go Home" and "Download App"
- Same header/navigation as main site
- GitHub Pages automatically serves this for broken links

## JavaScript Features

### Scroll Effects
- **Header blur**: Increases backdrop-filter blur on scroll
- **Parallax**: Phone mockups move slightly on scroll
- **Gradient shift**: Background hue shifts 0-60 degrees based on scroll position

### Intersection Observer Animations
- **Detection steps**: Left slide-in with stagger (breathing disruption section)
- **Breathing screenshot**: Scale + fade entrance
- **Testimonials**: Scale + fade with stagger
- **Section titles**: Word-by-word reveal animation

**Note**: Feature cards and FAQ items are static (no animations) for immediate visibility

### Interactive Elements
- Smooth scroll for anchor links (80px offset for header)
- Email obfuscation on contact button click
- Download button loading animation

### Performance Optimizations
- `requestAnimationFrame` for scroll events
- `ticking` flag to prevent excessive calculations
- Lazy loading for images
- WebP with PNG fallback
- Feature cards and FAQ items load without animation for faster perceived performance

## SEO & Meta Tags

### Meta Description
**Current**: "Meticulously designed snore tracking with interactive timeline visualization. Real-time detection, no data sampling, complete privacy. Free iOS app." (155 characters)

**Guidelines**:
- Keep under 155 characters to avoid truncation in search results
- Emphasizes key differentiators: meticulous design, no data sampling, privacy
- Consistent across meta description, Open Graph, and Twitter Card tags
- Reflects the thoughtful engineering and attention to detail throughout the app

### Structured Data (JSON-LD)
- Schema.org MobileApplication type
- 5-star rating (3 reviews)
- Feature list included
- Price: Free

### Open Graph Tags
- Full OG implementation for Facebook/LinkedIn
- Image: `app-screenshot.png`
- Type: website

### Twitter Card
- `summary_large_image` card type
- Same image as OG

### App Links
- iOS deep link: `snoretimeline://open`
- App Store ID: 6751759381

## Deployment

**Hosting**: GitHub Pages (free)
**Domain**: snoretimeline.com
**DNS Provider**: GoDaddy
**Repository**: https://github.com/mtuck063/snore-timeline-website.git
**Branch**: Deploys from `main` branch
**Build Time**: 1-5 minutes after push

### Infrastructure

**GitHub Pages (Hosting)**
- Free static site hosting
- Automatic SSL/HTTPS via Let's Encrypt
- Global CDN for fast delivery
- Automatic rebuild on every push to `main`
- Jekyll processing (configured via `_config.yml`)

**GoDaddy (DNS)**
- Domain registrar and DNS management
- DNS records point to GitHub Pages servers
- CNAME file in repo tells GitHub Pages which domain to serve

### DNS Configuration
The custom domain is configured with these DNS records at GoDaddy:
- `CNAME` record: `www.snoretimeline.com` → `mtuck063.github.io`
- `A` records for apex domain pointing to GitHub Pages IPs:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

The `CNAME` file in the repository root contains `snoretimeline.com` to enable custom domain hosting.

### Git Workflow

**IMPORTANT**: Always use `git commit --amend --no-edit` for commits.

This project maintains a clean commit history with a single "v1.0" commit. When making changes:

```bash
# ALWAYS run as a single chained command:
git add <files> && git commit --amend --no-edit && git push --force-with-lease
```

**Command breakdown:**
1. `git add <files>` - Stage your changes
2. `git commit --amend --no-edit` - Amend the existing commit without changing the message
3. `git push --force-with-lease` - Push with force (safer than --force)

**Why chain with `&&`?**
- These are dependent sequential operations that must run together
- If staging fails, commit won't run; if commit fails, push won't run
- More efficient than separate commands
- Follows best practices for git workflows

**Why this approach?**
- Keeps a clean, single-commit history for the marketing site
- All updates are iterations on v1.0
- Simplifies deployment tracking
- GitHub Pages automatically redeploys on push

**Never**:
- Run these commands separately
- Create new commits (unless explicitly changing version)
- Change the commit message (keep "v1.0")
- Use regular `git push` after amending (will be rejected)

## The iOS App (Context)

To effectively work on this marketing site, understand what you're promoting:

### App Features
- **Interactive Timeline**: Visual representation of entire sleep session
- **AI Detection**: Snoring, gasps, coughs, breathing disruptions
- **Episode Grouping**: Consecutive snores grouped into episodes (30s gap = new episode)
- **Breathing Disruption Detection**:
  - Requires 1 minute baseline of audible breathing
  - Detects 10+ second silent periods
  - Confirms with recovery sounds (gasps, coughs)
  - Marked with gray-blue indicators on timeline
  - **Note**: Audio analysis only—does NOT diagnose sleep apnea
- **Audio Playback**: Enhanced audio for clarity
- **Data Export**: CSV data + audio files
- **Complete Privacy**: All processing on-device, no cloud uploads
- **Bluetooth Support**: Works with AirPods and other devices
- **Free**: No subscription, all features included

### Key Value Propositions
1. **Visualization**: Interactive timeline showing every snoring episode
2. **Breathing Pause Detection**: Identifies 10+ second silent periods via audio analysis (not medical diagnosis)
3. **Privacy**: Zero data collection, on-device processing
4. **No Subscription**: All features included, no hidden costs

### User Pain Points Addressed
- Understanding snoring patterns and frequency
- Detecting breathing pauses to discuss with doctors
- Sharing objective data with healthcare providers
- Privacy concerns with health data
- Subscription fatigue from other sleep tracking apps

## Development Guidelines

### When Adding New Sections
1. Maintain dark theme consistency
2. Use CSS custom properties from design system
3. Consider whether animations improve or distract from user experience
4. Test on mobile (majority of traffic)
5. Maintain privacy-first approach (no tracking/analytics)

### When Editing Copy
- Emphasize privacy and no-subscription model
- Use active voice and clear benefits
- Include social proof where possible
- Maintain friendly, approachable tone
- Focus on user outcomes, not features

**Important Copy Guidelines:**
- **Avoid unsubstantiated superlatives**: Never claim "best" without data to back it up. Focus on specific, factual differentiators instead (e.g., "snore recorder with timeline visualization" not "best snore app")
- **No medical claims**: The app detects breathing pauses through audio analysis only—it does NOT diagnose sleep apnea. Always include disclaimers that it's not a medical device
- **Use "free" sparingly**: Overuse makes the app sound cheap. Place it intentionally (e.g., "Free on iOS • No Subscription" under CTA buttons) rather than repeating it throughout the copy
- **Be honest about capabilities**: The app analyzes audio, not oxygen levels or brain activity. Describe what it actually does, not what users might hope it does
- **Long-tail keywords**: Target specific, honest search phrases like "snore recorder with timeline", "snoring app that shows episodes", "breathing pause detection" rather than competitive terms

### When Optimizing Images
- Export PNGs at 2x resolution for retina displays
- Create WebP versions for modern browsers
- Use `<picture>` tags with fallbacks
- Keep hero video under 5MB

### When Adding CTAs
- Use `btn btn-primary btn-large` classes
- Include Apple icon SVG in buttons
- Include rel="noopener noreferrer" for external links
- Use App Store smart link with campaign tracking (pt and ct parameters)

### Accessibility Considerations
- Include `aria-label` for sections
- Use semantic HTML (`article`, `section`, `aside`)
- Maintain color contrast ratios
- Provide alt text for all images
- Support keyboard navigation

## Common Tasks

### Update App Store Link
Search for `id6751759381` and update campaign parameters if needed.

### Change Hero Video
Replace `hero-recording.mp4` (keep under 5MB, use H.264 codec).

### Add New Testimonial
1. Add to testimonials grid in index.html
2. Use existing card structure
3. Include source icon (Reddit/App Store)
4. Testimonial animations are automatically applied via existing Intersection Observer

### Modify Color Scheme
Update CSS custom properties in `:root` selector at top of styles.css.

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 300ms
- **Cumulative Layout Shift**: < 0.1

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile**: iOS Safari 13+, Chrome Android
- **Graceful degradation**: WebP with PNG fallback, CSS feature queries

## Important Notes

- **No build process**: All files are served directly
- **Video autoplay**: Requires `muted` attribute for mobile
- **Email obfuscation**: Prevents scraping by bots
- **Smart App Banner**: Handled by meta tags, not JavaScript
- **Privacy policy**: Legal requirement for App Store, keep updated
