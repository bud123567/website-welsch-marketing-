# Welsch Marketing design

The original main-branch website is the visual authority. Preserve the supplied logo, photographic background, dark glass panels, pill navigation and buttons, Inter/Playfair typography, original copy, service icons, portfolio cards, and embedded project previews. Do not introduce a new palette, wordmark, or layout language.

Changes are limited to moving the existing Typeform immediately below the hero, letting the hero fill the first screen with a frosted preview of the form below, giving the form a clear full-width surface and direct fallback, and adding Corner’s Surf Co. in the existing portfolio-card style.

The Typeform live ID remains `01KBZTCJP9MBPVX948Y415XC35`; its resolved form and fallback are `wFckcTv0`. The original form provider owns validation and submission.

Corner’s URL, https://cornerssurf.com/, is verified from the account repository CNAME and canonical metadata. The production marketing domain is https://welschmarketing.com/. SEO metadata and social imagery must describe the original brand truthfully.

The original blue image appears exactly once in `.site-backdrop`, a fixed, non-repeating viewport-covering layer behind the full document. Content scrolls above it. Use stable large-viewport height on mobile to avoid image rescaling when browser chrome collapses. Do not add section-specific copies or make the image a scrolling content element. Review this behavior with viewport screenshots taken at multiple scroll positions; a stitched full-page capture cannot represent a fixed backdrop accurately.

The hosting promotion is a viewport-fixed cyan announcement strip above the original navigation, with continuous scrolling text and a slow glow pulse. It links to the inquiry form and pauses on hover or keyboard focus, without a visible play/pause button. Respect reduced-motion settings with a static wrapped announcement. Keep the actual claim deadline of February 18, 2027. The form section must not include personal contact details or a save-contact link; retain only the hero texting action.

The hero fills at least the first viewport, leaving only a small edge of the inquiry panel at the bottom when content fits. The inquiry panel is frosted while below the viewport’s reveal threshold and clears on scroll or keyboard focus. Reduced-motion and no-JavaScript users receive a clear form. Never clip hero content at short viewport heights.

The dedicated inquiry route is `/start-project.html`. Homepage inquiry calls to action use this route; the existing inline form and legacy `#start-project` anchor remain usable. The dedicated page reuses the same stylesheet tokens, navigation, background, footer, Typeform integration and fallback, with no frosted reveal or full-screen hero before the form. The provider continues to own submissions and validation. No Google Analytics measurement ID is configured by this change.
