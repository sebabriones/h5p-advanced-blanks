/**
 * Play area 16:9 layout helpers (pattern from Multi Choice / Sort Paragraphs CFRD).
 */

import { getInstructionsOptions } from './instructions';

/**
 * Wrap activity content in an inner play area; keep evaluation footer outside 16:9.
 */
export function setupPlayAreaLayout($container: any): any {
  const $ = H5P.jQuery;
  let $playArea = $container.children('.h5p-ab-play-area').first();
  const playAreaSelectors = [
    '.h5p-question-image',
    '.h5p-question-video',
    '.h5p-question-audio',
    '.h5p-question-introduction',
    '.h5p-question-content',
  ];

  if (!$playArea.length) {
    $playArea = $('<div>', { 'class': 'h5p-ab-play-area' });
    $container.prepend($playArea);
  }

  playAreaSelectors.forEach((selector) => {
    $container.children(selector).appendTo($playArea);
  });

  const $content = $playArea.children('.h5p-question-content');
  if ($content.hasClass('h5p-ab-with-context')) {
    $content.removeClass('h5p-ab-task-only');
  }
  else {
    $content.addClass('h5p-ab-task-only');
  }

  return $playArea;
}

/**
 * Whether setFeedback will show overall feedback as a popup in the play area.
 */
export function usesFeedbackPopup(content: any, popupSettings: any): boolean {
  return popupSettings != null &&
    popupSettings.showAsPopup === true &&
    content !== undefined &&
    String(content).trim().length > 0;
}

/**
 * Move inline scorebar/feedback out of the play area.
 */
export function normalizeInlineEvaluationLayout($container: any): void {
  const $ = H5P.jQuery;
  const $playArea = $container.children('.h5p-ab-play-area').first();
  let $feedback;
  let $scorebar;
  let $buttons;

  if (!$playArea.length) {
    return;
  }

  $playArea.children('.h5p-question-feedback:not(.h5p-question-popup)').appendTo($container);
  $playArea.children('.h5p-question-scorebar').appendTo($container);

  $feedback = $container.children('.h5p-question-feedback:not(.h5p-question-popup)');
  $scorebar = $container.children('.h5p-question-scorebar');
  $buttons = $container.children('.h5p-question-buttons');

  if ($scorebar.length && $buttons.length) {
    $scorebar.insertBefore($buttons);
  }

  if ($feedback.length && $scorebar.length) {
    $feedback.insertBefore($scorebar);
  }
  else if ($feedback.length && $buttons.length) {
    $feedback.insertBefore($buttons);
  }
}

/**
 * @param {H5P.jQuery} $container
 * @param {object} [instance]
 */
export function scheduleInlineEvaluationLayout($container: any, instance?: any): void {
  [0, 50, 200].forEach((delay) => {
    setTimeout(() => {
      if (!$container || !$container.length) {
        return;
      }
      normalizeInlineEvaluationLayout($container);
      if (instance && typeof instance.trigger === 'function') {
        instance.trigger('resize', { repositionOnly: true });
      }
    }, delay);
  });
}

/**
 * Re-apply Instructions scale after play-area font-size changes.
 */
export function refreshInstructionsScale(instance: any): void {
  const instructions = getInstructionsOptions(instance);
  const $target = (instance.$playArea && instance.$playArea.length) ?
    instance.$playArea :
    ((instance.$instructionsTarget && instance.$instructionsTarget.length) ?
      instance.$instructionsTarget :
      instance.$container);

  if (!instructions || !$target || !$target.length) {
    return;
  }

  if (H5P.Instructions && typeof H5P.Instructions.updateScale === 'function') {
    H5P.Instructions.updateScale($target, instructions);
  }
}

/**
 * Scale play area font-size from width (16:9 design width 640).
 */
export function applyPlayAreaScale(instance: any, event?: any): void {
  const PlayArea = H5P.AdvancedBlanksCFRD && H5P.AdvancedBlanksCFRD.PlayArea;
  const design = instance.playAreaSize || (PlayArea ? PlayArea.getDesignSize() : null);
  let $parent;
  let width;
  let scale;
  let fontSize;

  if (event && event.data && event.data.repositionOnly) {
    return;
  }

  if (!instance.$playArea || !instance.$playArea.length || !PlayArea || !design) {
    return;
  }

  if (!instance.$playArea.is(':visible')) {
    scheduleDeferredResize(instance);
    return;
  }

  $parent = instance.$playArea.parent();
  width = instance.$playArea.width();

  if (width <= 0) {
    width = ($parent && $parent.width()) || design.baseWidth;
  }

  scale = PlayArea.getScale(width);
  fontSize = (design.baseFontSize * scale) + 'px';

  if (instance._abLastScaleKey === scale.toFixed(4) && instance._abLastWidth === width) {
    return;
  }

  instance._abLastScaleKey = scale.toFixed(4);
  instance._abLastWidth = width;

  instance.$playArea.css({
    width: '100%',
    height: '',
    fontSize: fontSize,
    '--ab-scale': scale.toFixed(4)
  });

  const $popup = instance.$playArea.find('.h5p-question-feedback.h5p-question-popup');
  if ($popup.length) {
    $popup.css('fontSize', fontSize);
    if ($popup.hasClass('h5p-question-visible')) {
      setTimeout(() => {
        if (instance && typeof instance.trigger === 'function') {
          instance.trigger('resize', { repositionOnly: true });
        }
      }, 0);
    }
  }

  refreshInstructionsScale(instance);
}

/**
 * Retry resize when the play area is not visible yet.
 */
export function scheduleDeferredResize(instance: any): void {
  if (instance._abDeferredResizeTimer) {
    return;
  }

  instance._abDeferredResizeTimer = setTimeout(() => {
    instance._abDeferredResizeTimer = null;
    if (instance && typeof instance.trigger === 'function') {
      instance.trigger('resize');
    }
  }, 100);
}

/**
 * Observe play area size changes.
 */
export function observePlayArea(instance: any): void {
  if (!window.ResizeObserver || !instance.$playArea || !instance.$playArea.length) {
    return;
  }

  if (instance.playAreaResizeObserver) {
    return;
  }

  instance.playAreaResizeObserver = new ResizeObserver(() => {
    if (typeof instance.trigger === 'function') {
      instance.trigger('resize');
    }
  });
  instance.playAreaResizeObserver.observe(instance.$playArea[0]);
}
