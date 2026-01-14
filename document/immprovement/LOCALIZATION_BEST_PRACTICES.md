# Localization Improvements (Best Practices)

This document captures potential improvements for the frontend localization setup, based on a review of the current implementation.

## Potential improvements to align more closely with best practice

1. **Handle region-specific locales more robustly**
   - The UI currently checks `i18n.language === "ar"` for RTL or selected language. If the detector resolves region variants like `ar-SA` or `en-US`, these checks may fail.
   - **Recommendation:** Normalize to base language (e.g., set `load: "languageOnly"`) or compare with `startsWith("ar")` / use `i18n.resolvedLanguage`.

2. **Move remaining hardcoded UI strings to translation files**
   - Some layout strings (e.g., "History", "Logistics Ops", "My Account") are still hardcoded, which leaves parts of the UI untranslated in Arabic.
   - **Recommendation:** Add translation keys for these strings in both locale files and use `t(...)` everywhere in the UI.

3. **Avoid global `text-align` overrides for RTL**
   - The CSS sets `text-align: right` at the document level for `[dir="rtl"]`, which can misalign mixed-direction content (numbers, codes, etc.).
   - **Recommendation:** Prefer targeted alignment on layout containers or use logical properties/RTL-aware utilities to avoid unintended global effects.

4. **Make RTL icon mirroring more systematic**
   - The `.rtl:mirror` utility requires manual usage and can be missed for some icons.
   - **Recommendation:** Adopt a consistent pattern for RTL icon usage (e.g., RTL-aware icon components or a global style convention).
