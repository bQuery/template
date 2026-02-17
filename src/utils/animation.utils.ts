/**
 * @module AnimationUtils
 * Motion and transition helpers built on top of bQuery's motion primitives.
 */

import {
  animate,
  keyframePresets,
  spring,
  springPresets,
  transition,
  type Spring,
} from '@bquery/bquery/motion';

/** Default animation duration in milliseconds. */
const DEFAULT_DURATION = 300;

/**
 * Perform a page-level view transition.
 *
 * Wraps bQuery's {@link transition} helper to apply the View Transitions
 * API (with an automatic fallback) around a DOM update function.
 *
 * @param updateFn - A callback that mutates the DOM for the new page state.
 * @returns A promise that resolves when the transition completes.
 *
 * @example
 * ```ts
 * await pageTransition(() => {
 *   renderPage(newContent);
 * });
 * ```
 */
export async function pageTransition(updateFn: () => void): Promise<void> {
  await transition({ update: updateFn });
}

/**
 * Fade an element into view.
 *
 * Uses the {@link keyframePresets.fadeIn} keyframes via bQuery's
 * {@link animate} helper.
 *
 * @param element  - The DOM element to fade in.
 * @param duration - Animation duration in milliseconds (default {@link DEFAULT_DURATION}).
 * @returns A promise that resolves when the animation finishes.
 *
 * @example
 * ```ts
 * await fadeIn(document.getElementById("hero")!, 500);
 * ```
 */
export async function fadeIn(
  element: Element,
  duration: number = DEFAULT_DURATION
): Promise<void> {
  await animate(element, {
    keyframes: keyframePresets.fadeIn(),
    options: { duration },
    commitStyles: true,
    respectReducedMotion: true,
  });
}

/**
 * Fade an element out of view.
 *
 * Uses the {@link keyframePresets.fadeOut} keyframes via bQuery's
 * {@link animate} helper.
 *
 * @param element  - The DOM element to fade out.
 * @param duration - Animation duration in milliseconds (default {@link DEFAULT_DURATION}).
 * @returns A promise that resolves when the animation finishes.
 *
 * @example
 * ```ts
 * await fadeOut(toastElement, 200);
 * ```
 */
export async function fadeOut(
  element: Element,
  duration: number = DEFAULT_DURATION
): Promise<void> {
  await animate(element, {
    keyframes: keyframePresets.fadeOut(),
    options: { duration },
    commitStyles: true,
    respectReducedMotion: true,
  });
}

/** Maps a direction label to the corresponding slide-in keyframe preset. */
const slidePresetMap = {
  up: keyframePresets.slideInUp,
  down: keyframePresets.slideInDown,
  left: keyframePresets.slideInLeft,
  right: keyframePresets.slideInRight,
} as const;

/**
 * Slide an element into view from a given direction.
 *
 * @param element   - The DOM element to animate.
 * @param direction - The direction to slide from (default `"up"`).
 * @param duration  - Animation duration in milliseconds (default {@link DEFAULT_DURATION}).
 * @returns A promise that resolves when the animation finishes.
 *
 * @example
 * ```ts
 * await slideIn(panel, "left", 400);
 * ```
 */
export async function slideIn(
  element: Element,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  duration: number = DEFAULT_DURATION
): Promise<void> {
  const presetFn = slidePresetMap[direction];

  await animate(element, {
    keyframes: presetFn(),
    options: { duration },
    commitStyles: true,
    respectReducedMotion: true,
  });
}

/**
 * Create a {@link Spring} configured with the **bouncy** preset.
 *
 * @param initial - The initial spring value (default `0`).
 * @returns A new {@link Spring} instance.
 *
 * @example
 * ```ts
 * const s = createBouncySpring(0);
 * s.onChange((v) => (element.style.transform = `scale(${v})`));
 * await s.to(1);
 * ```
 */
export function createBouncySpring(initial = 0): Spring {
  return spring(initial, springPresets.bouncy);
}

/**
 * Create a {@link Spring} configured with the **snappy** preset.
 *
 * @param initial - The initial spring value (default `0`).
 * @returns A new {@link Spring} instance.
 *
 * @example
 * ```ts
 * const s = createSnappySpring(100);
 * await s.to(0);
 * ```
 */
export function createSnappySpring(initial = 0): Spring {
  return spring(initial, springPresets.snappy);
}

/**
 * Apply a quick "pop" animation to an element.
 *
 * Uses the {@link keyframePresets.pop} keyframes for an eye-catching
 * scale-up-and-back effect.
 *
 * @param element - The DOM element to animate.
 * @returns A promise that resolves when the animation finishes.
 *
 * @example
 * ```ts
 * button.addEventListener("click", () => popElement(button));
 * ```
 */
export async function popElement(element: Element): Promise<void> {
  await animate(element, {
    keyframes: keyframePresets.pop(),
    options: { duration: DEFAULT_DURATION },
    commitStyles: true,
    respectReducedMotion: true,
  });
}

// Re-export Spring type for consumers that need to type their own variables.
export type { Spring };
