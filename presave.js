var H5PEditor = H5PEditor || {};
var H5PPresave = H5PPresave || {};

/**
 * Migrate legacy parameters that upgrades.js could not process (patch-level
 * migrations under 1.0.x are ignored by the H5P core upgrade runner).
 * Every step is idempotent.
 *
 * @param {Object} p – full content parameters
 */
function migrateLegacyParameters(p) {
  if (!p) { return; }

  /* ── Patch 5: media image → context.media ── */
  if (!p.context && p.media) {
    var media = p.media;
    if (media.type && media.type.library && media.type.library.indexOf('H5P.Image') === 0) {
      p.context = {
        media: {
          type: media.type,
          disableImageZooming: media.disableImageZooming || false
        }
      };
    }
    delete p.media;
  }

  /* ── Patch 9: overallFeedback array → object with popup colours ── */
  var of = p.overallFeedback;
  if (Array.isArray(of)) {
    p.overallFeedback = {
      popupBackgroundColor: '#ffffff',
      feedbackTextColor: '#333333',
      overallFeedback: of
    };
    of = p.overallFeedback;
  }
  else if (of && typeof of === 'object' && !of.popupBackgroundColor) {
    of.popupBackgroundColor = '#ffffff';
    if (!of.feedbackTextColor) { of.feedbackTextColor = '#333333'; }
  }

  /* ── Patch 11: flatten nested range entries ── */
  of = p.overallFeedback;
  if (of && Array.isArray(of.overallFeedback)) {
    var ranges = [];
    for (var i = 0; i < of.overallFeedback.length; i++) {
      var entry = of.overallFeedback[i] || {};
      if (entry.overallFeedback && typeof entry.overallFeedback === 'object') {
        ranges.push(entry.overallFeedback);
      }
      else {
        ranges.push(entry);
      }
    }
    p.overallFeedback = {
      popupBackgroundColor: of.popupBackgroundColor || '#ffffff',
      feedbackTextColor: of.feedbackTextColor || '#333333',
      overallFeedback: ranges
    };
  }
}

/**
 * Resolve the presave logic for Advanced Blanks (CFRD).
 *
 * @param {object} content
 * @param {function} finished
 */
H5PPresave['H5P.AdvancedBlanksCFRD'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 1;

  migrateLegacyParameters(content);

  if (!content || !content.content || !content.content.task || !content.content.task.text) {
    throw new presave.exceptions.InvalidContentSemanticsException(
      'Invalid Advanced Blanks Error'
    );
  }

  var blankMatches = content.content.task.text.match(/___/g);
  if (blankMatches && blankMatches.length > 0) {
    score = blankMatches.length;
  }

  presave.validateScore(score);
  finished({ maxScore: score });
};
