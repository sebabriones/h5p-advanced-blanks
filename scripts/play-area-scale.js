var H5P = H5P || {};

H5P.AdvancedBlanksCFRD = H5P.AdvancedBlanksCFRD || {};

/**
 * Play area aspect ratio (Course Presentation style: 16:9, fluid width).
 */
H5P.AdvancedBlanksCFRD.PlayArea = (function () {
  var BASE_WIDTH = 640;
  var ASPECT_RATIO = 16 / 9;
  var BASE_HEIGHT = Math.round(BASE_WIDTH / ASPECT_RATIO);
  var BASE_FONT_SIZE = 16;
  var MIN_SCALE = 0.35;
  var MAX_SCALE = 1;

  /**
   * @returns {{width: number, height: number, ratio: number, baseWidth: number, baseHeight: number, baseFontSize: number}}
   */
  function getDesignSize() {
    return {
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      ratio: ASPECT_RATIO,
      baseWidth: BASE_WIDTH,
      baseHeight: BASE_HEIGHT,
      baseFontSize: BASE_FONT_SIZE
    };
  }

  /**
   * @param {number} width Container width in px
   * @returns {number}
   */
  function getScale(width) {
    if (!width || width <= 0) {
      return 1;
    }

    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, width / BASE_WIDTH));
  }

  return {
    BASE_WIDTH: BASE_WIDTH,
    BASE_HEIGHT: BASE_HEIGHT,
    ASPECT_RATIO: ASPECT_RATIO,
    BASE_FONT_SIZE: BASE_FONT_SIZE,
    MIN_SCALE: MIN_SCALE,
    MAX_SCALE: MAX_SCALE,
    getDesignSize: getDesignSize,
    getScale: getScale
  };
})();
