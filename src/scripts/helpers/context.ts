/**
 * Context column helpers (pattern from Multi Choice CFRD).
 */

function stripHtmlText(html: any): string {
  if (html === undefined || html === null) {
    return '';
  }
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function hasContextText(context: any): boolean {
  return !!(context && context.text && stripHtmlText(context.text));
}

export function hasContextImage(context: any): boolean {
  const media = context && context.media;
  const type = media && media.type;
  return !!(type && type.library && type.params && type.params.file);
}

/**
 * @returns CSS modifier class or null when there is no context.
 */
export function getContextLayoutClass(context: any): string | null {
  const hasText = hasContextText(context);
  const hasImage = hasContextImage(context);

  if (!hasText && !hasImage) {
    return null;
  }

  if (hasText && hasImage) {
    return 'h5p-ab-context--both';
  }

  if (hasText) {
    return 'h5p-ab-context--text-only';
  }

  return 'h5p-ab-context--image-only';
}

export function attachContextImage(context: any, contentId: any, $container: any): void {
  const media = context && context.media;
  const library = media && media.type;

  if (!library || !library.library || !$container || !$container.length) {
    return;
  }

  H5P.newRunnable(library, contentId, $container);
}

export function scheduleContextImageAttach(instance: any): void {
  const pending = instance.pendingContextImage;

  if (!pending || !pending.$container || !pending.$container.length) {
    return;
  }

  [0, 50, 200].forEach((delay) => {
    setTimeout(() => {
      if (!pending.$container.find('.h5p-image, img').length) {
        attachContextImage(pending.context, instance.contentId, pending.$container);
      }
      if (instance && typeof instance.trigger === 'function') {
        instance.trigger('resize');
      }
    }, delay);
  });
}

/**
 * Migrate legacy top-level media (image above question) to context.media.
 */
export function migrateMediaToContext(params: any): void {
  let media;
  let library;

  if (!params || params.context || !params.media) {
    return;
  }

  media = params.media;
  if (!media.type) {
    delete params.media;
    return;
  }

  library = media.type;
  if (library && library.library && library.library.indexOf('H5P.Image') === 0) {
    params.context = {
      media: {
        type: library,
        disableImageZooming: media.disableImageZooming || false
      }
    };
  }

  delete params.media;
}
