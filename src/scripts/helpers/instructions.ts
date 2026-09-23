/**
 * CFRD helpers for H5P.Instructions integration.
 */

function isTruthy(value: any): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

/**
 * Build options for H5P.Instructions.attach, or null when disabled/empty.
 */
export function getInstructionsOptions(instance: any): any {
  const instructions = instance && instance.options && instance.options.instructions;
  let text: string;

  if (!instructions || !isTruthy(instructions.enabled)) {
    return null;
  }

  text = (instructions.text === undefined || instructions.text === null) ?
    '' :
    String(instructions.text).trim();

  if (!text) {
    return null;
  }

  return {
    id: instance.contentId || instance.id,
    text: text,
    displayMode: instructions.displayMode || 'both',
    introButtonLabel: instructions.introButtonLabel || 'Start',
    tabButtonLabel: instructions.tabButtonLabel || 'Instructions',
    tabButtonLabelOpen: instructions.tabButtonLabelOpen,
    animation: H5P.jQuery.extend(true, {}, instructions.animation || {}),
    appearance: H5P.jQuery.extend(true, {}, instructions.appearance || {}),
    startCollapsed: instructions.startCollapsed === undefined ?
      true :
      isTruthy(instructions.startCollapsed),
  };
}

/**
 * Embedded instances (Course Presentation, Interactive Video) delegate
 * instructions to the host, which sizes them for the whole activity.
 */
export function isEmbeddedInstance(instance: any): boolean {
  return !!(instance && typeof instance.isRoot === 'function' && !instance.isRoot());
}

/**
 * Attach instructions after the question DOM is ready.
 */
export function scheduleInstructionsAttach(instance: any, $fallbackContainer: any): void {
  if (isEmbeddedInstance(instance)) {
    return;
  }

  [0, 200, 500].forEach((delay) => {
    setTimeout(() => {
      const instructions = getInstructionsOptions(instance);
      const $target = (instance.$playArea && instance.$playArea.length) ?
        instance.$playArea :
        ((instance.$instructionsTarget && instance.$instructionsTarget.length) ?
          instance.$instructionsTarget :
          ((instance.$container && instance.$container.length) ?
            instance.$container :
            $fallbackContainer));
      let attached: any;

      if (!instructions || !$target || !$target.length) {
        return;
      }

      if (
        $target.find('.h5p-instructions-root').length ||
        ($target.parent().length && $target.parent().children('.h5p-instructions-root').length)
      ) {
        instance.trigger('resize');
        return;
      }

      if (H5P.Instructions && typeof H5P.Instructions.attach === 'function') {
        attached = H5P.Instructions.attach($target, instructions);

        if (attached) {
          instance.trigger('resize');
        }
      }
    }, delay);
  });
}
