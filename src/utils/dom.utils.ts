/**
 * @module DomUtils
 * DOM helper utilities built on top of bQuery core primitives.
 */

import { $ } from '@bquery/bquery/core';

/** Default prefix prepended to every page title. */
const APP_TITLE_PREFIX = 'bQuery App';

/**
 * Scroll the window to the top of the page.
 *
 * @param smooth - When `true` (default), uses smooth scrolling behaviour.
 *
 * @example
 * ```ts
 * scrollToTop();       // smooth scroll
 * scrollToTop(false);  // instant scroll
 * ```
 */
export function scrollToTop(smooth = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'instant',
  });
}

/**
 * Set the document title with the application prefix.
 *
 * The resulting title follows the pattern `"<title> | <APP_TITLE_PREFIX>"`.
 *
 * @param title - The page-specific portion of the title.
 *
 * @example
 * ```ts
 * setPageTitle("Dashboard"); // "Dashboard | bQuery App"
 * ```
 */
export function setPageTitle(title: string): void {
  document.title = `${title} | ${APP_TITLE_PREFIX}`;
}

/**
 * Add one or more CSS classes to the `<body>` element.
 *
 * @param classes - Class names to add.
 *
 * @example
 * ```ts
 * addBodyClass("dark-mode", "sidebar-open");
 * ```
 */
export function addBodyClass(...classes: string[]): void {
  $('body').addClass(...classes);
}

/**
 * Remove one or more CSS classes from the `<body>` element.
 *
 * @param classes - Class names to remove.
 *
 * @example
 * ```ts
 * removeBodyClass("sidebar-open");
 * ```
 */
export function removeBodyClass(...classes: string[]): void {
  $('body').removeClass(...classes);
}

/**
 * Create a DOM {@link Element} from an HTML string.
 *
 * The first child element of the parsed HTML is returned. If the HTML
 * string does not produce a valid element, an error is thrown.
 *
 * @param html - A valid HTML string representing a single root element.
 * @returns The newly created {@link Element}.
 * @throws {Error} When the HTML string does not produce a valid element.
 *
 * @example
 * ```ts
 * const card = createElementFromHtml('<div class="card">Hello</div>');
 * document.body.appendChild(card);
 * ```
 */
export function createElementFromHtml(html: string): Element {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  const element = template.content.firstElementChild;
  if (!element) {
    throw new Error('Invalid HTML string: no element could be created.');
  }

  return element;
}

/**
 * Wait for an element matching the given selector to appear in the DOM.
 *
 * Polls the DOM at short intervals until the element is found or the
 * timeout is exceeded.
 *
 * @param selector - A CSS selector string.
 * @param timeout  - Maximum time to wait in milliseconds (default `5000`).
 * @returns A promise that resolves with the found {@link Element}.
 * @throws {Error} When the element is not found within the timeout period.
 *
 * @example
 * ```ts
 * const modal = await waitForElement("#confirm-modal", 3000);
 * ```
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<Element> {
  return new Promise<Element>((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const pollInterval = 50;
    let elapsed = 0;

    const intervalId = setInterval(() => {
      elapsed += pollInterval;

      const element = document.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
        return;
      }

      if (elapsed >= timeout) {
        clearInterval(intervalId);
        reject(
          new Error(
            `waitForElement: "${selector}" not found within ${timeout}ms.`
          )
        );
      }
    }, pollInterval);
  });
}

/**
 * Determine whether an element is currently visible within the viewport.
 *
 * Uses {@link Element.getBoundingClientRect} to check intersection with
 * the visible window area.
 *
 * @param element - The DOM element to check.
 * @returns `true` when the element is at least partially inside the viewport.
 *
 * @example
 * ```ts
 * if (isInViewport(myElement)) {
 *   console.log("Element is visible!");
 * }
 * ```
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right > 0
  );
}
