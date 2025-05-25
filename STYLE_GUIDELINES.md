# Style Guidelines for Advocate AI

This document outlines global style definitions for the Advocate AI project. It serves as a conceptual guide to ensure a consistent and professional look and feel across the application. We primarily leverage Tailwind CSS, so this guide will reference its classes and principles.

## 1. Color Palette

Our color palette aims for a modern, trustworthy, and clean aesthetic.

### Primary Color

-   **Conceptual Name:** "Primary Teal"
-   **Description:** A modern and trustworthy teal, suitable for primary actions, branding accents, and important UI elements.
-   **Tailwind CSS Usage (Conceptual - exact shades can be fine-tuned):**
    -   Backgrounds: `bg-teal-600` (for buttons, headers)
    -   Text: `text-teal-700` (for links, important text)
    -   Darker shade for hover/active: `hover:bg-teal-700`, `active:bg-teal-800`
    -   Lighter shade for accents/backgrounds: `bg-teal-50`, `text-teal-600`

### Secondary Color (Accent)

-   **Conceptual Name:** "Accent Orange"
-   **Description:** A vibrant warm orange for calls to action, highlights, or to draw attention to specific features. Use sparingly to maintain its impact.
-   **Tailwind CSS Usage (Conceptual):**
    -   Backgrounds: `bg-orange-500`
    -   Text: `text-orange-600`
    -   Hover/active: `hover:bg-orange-600`

### Neutral Colors

A range of grays for text, backgrounds, borders, ensuring a clean and readable interface.

-   **Neutral Gray Light:**
    -   Description: For backgrounds of sections, cards, disabled states.
    -   Tailwind: `bg-gray-50`, `bg-gray-100`, `border-gray-200`
-   **Neutral Gray Medium:**
    -   Description: For body text, secondary text, icons, borders.
    -   Tailwind: `text-gray-600`, `text-gray-700`, `border-gray-300`, `bg-gray-200`
-   **Neutral Gray Dark:**
    -   Description: For primary text, headings.
    -   Tailwind: `text-gray-800`, `text-gray-900`, `bg-gray-700` (for dark mode elements)

### Status Colors

Clear and distinct colors for feedback messages.

-   **Success:**
    -   Conceptual Name: "Success Green"
    -   Tailwind: `text-green-600` (text), `bg-green-50` (light background), `border-green-500`
-   **Error:**
    -   Conceptual Name: "Error Red"
    -   Tailwind: `text-red-600` (text), `bg-red-50` (light background), `border-red-500`
-   **Warning:**
    -   Conceptual Name: "Warning Yellow"
    -   Tailwind: `text-yellow-600` or `text-amber-600` (text), `bg-yellow-50` or `bg-amber-50` (light background), `border-yellow-500` or `border-amber-500`

### General Principle

Strive for a clean, uncluttered look. Avoid using too many competing colors simultaneously. Let whitespace and typography play a significant role in the visual hierarchy.

## 2. Typography

Typography choices should prioritize readability and a modern feel.

### Font Family

-   **Primary Font (Sans-serif):**
    -   **Recommendation:** Utilize Tailwind CSS's default `font-sans` stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`).
    -   **Rationale:** This stack prioritizes system fonts for optimal performance and native feel, while providing excellent fallbacks. It's highly readable and modern. Avoid adding custom web fonts unless there's a strong branding requirement, to maintain simplicity and performance.
-   **Monospace Font (for code snippets, if needed):**
    -   **Recommendation:** Tailwind's default `font-mono` stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`).

### Typographic Scale & Styling

Leverage Tailwind's utility classes for a consistent typographic hierarchy.

-   **Heading 1 (h1):**
    -   Usage: Main page titles.
    -   Tailwind: `text-3xl font-bold text-gray-900` (adjust size to `text-4xl` for significant landing page titles if needed, but `3xl` is a good default).
-   **Heading 2 (h2):**
    -   Usage: Section titles.
    -   Tailwind: `text-2xl font-bold text-gray-800`
-   **Heading 3 (h3):**
    -   Usage: Sub-section titles, card headers.
    -   Tailwind: `text-xl font-semibold text-gray-800`
-   **Body Text (p):**
    -   Usage: Standard paragraph text.
    -   Tailwind: `text-base font-normal text-gray-700` (Tailwind's default for `p` is generally good).
-   **Small Text:**
    -   Usage: Captions, helper text, secondary information.
    -   Tailwind: `text-sm text-gray-600`
-   **Link Styling:**
    -   Color: `text-teal-600` (Primary Teal)
    -   Hover: `hover:text-teal-700 hover:underline`
    -   Focus: Consistent with Tailwind's default focus ring, or a custom `focus:ring-teal-500`.

### Line Height & Letter Spacing

-   **Line Height:** Use Tailwind's default line-height utilities.
    -   `leading-normal` (1.5) for body text is generally good for readability.
    -   `leading-tight` (1.25) can be used for headings if desired.
    -   `leading-relaxed` (1.625) can be used for longer blocks of text to improve readability.
-   **Letter Spacing:** Typically, Tailwind's default letter spacing (`tracking-normal`) is sufficient.
    -   `tracking-tight` can be used for larger headings to reduce spacing slightly.

## 3. Spacing and Sizing

Consistency in spacing and sizing is key to a polished UI.

### Principle

-   Adhere to Tailwind CSS's default spacing scale, which is based on a 4px grid system (e.g., `p-1` = 4px, `p-2` = 8px, `m-4` = 16px, `space-x-4` = 16px horizontal spacing between children).
-   Use multiples of this base unit for margins, paddings, gaps, and component dimensions where feasible.

### Application

-   **Layout Elements:** Use consistent padding for page containers (e.g., `px-4 sm:px-6 lg:px-8`).
-   **Sections:** Apply consistent vertical spacing between page sections (e.g., `py-8`, `py-12`).
-   **Components:**
    -   Buttons, inputs, and other interactive elements should have consistent internal padding.
    -   Cards and other container-like components should use consistent internal padding (e.g., `p-4` or `p-6`).
    -   Maintain consistent margins or gaps between elements within a component or section (e.g., `space-y-4` for vertical stacking, `gap-4` for grids).

### Component Sizing

-   While not always strict, aim for component heights and widths that align with the spacing rhythm when possible (e.g., button heights, input heights). This contributes to visual harmony.

## 4. General Style Notes

### Border Radius

-   Apply consistent border radiuses to elements to maintain a unified style.
-   **Recommendation:**
    -   `rounded-md` (0.375rem / 6px): Good default for buttons, inputs, cards, modals.
    -   `rounded-lg` (0.5rem / 8px): For larger elements or a slightly softer look.
    -   `rounded-full`: For circular elements like avatars or icon buttons.
-   Choose one or two standard radiuses and use them consistently.

### Shadows

-   Use shadows subtly to create depth and elevate elements, especially for interactive or layered components.
-   **Recommendation:**
    -   `shadow-sm`: For subtle elevation on elements like focused inputs or very light cards.
    -   `shadow-md`: Good default for cards, dropdowns, modals.
    -   `shadow-lg`: For elements that need to appear more prominent, like important popovers or modals.
    -   `shadow-xl` or `shadow-2xl`: Use very sparingly for maximum emphasis.
-   Avoid overly heavy or dark shadows to maintain a clean look.

---

This style guide provides a foundational set of rules. As the application evolves, these guidelines can be further refined and expanded. The key is consistency and a focus on user experience through clear, readable, and aesthetically pleasing design choices.
