var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.AdvancedBlanksCFRD'] = (function () {
  return {
    1: {
      /**
       * Legacy upstream upgrade path (pre-CFRD 1.1.x identity).
       */
      1: {
        contentUpgrade: function (parameters, finished, extras) {
          if (parameters) {
            const newMedia = {
              disableImageZooming: parameters.behaviour && parameters.behaviour.disableImageZooming || false,
            };

            delete parameters.behaviour.disableImageZooming;

            if (parameters.media) {
              newMedia.type = parameters.media;
            }

            parameters.media = newMedia;
          }

          finished(null, parameters, extras);
        }
      },
      /**
       * CFRD 1.0.x upgrades.
       */
      0: {
        /**
         * Move legacy top-level media image into context.media (CFRD layout).
         * Drop non-image media (same behaviour as Multi Choice CFRD).
         *
         * @param {object} parameters
         * @param {function} finished
         */
        5: function (parameters, finished) {
          var media;
          var library;

          if (!parameters || parameters.context || !parameters.media) {
            finished(null, parameters);
            return;
          }

          media = parameters.media;

          if (!media.type) {
            delete parameters.media;
            finished(null, parameters);
            return;
          }

          library = media.type;

          if (library && library.library && library.library.indexOf('H5P.Image') === 0) {
            parameters.context = {
              media: {
                type: library,
                disableImageZooming: media.disableImageZooming || false
              }
            };
          }

          delete parameters.media;
          finished(null, parameters);
        },

        /**
         * Wrap legacy overallFeedback array and ensure popup color defaults (CFRD popup pattern).
         *
         * @param {object} parameters
         * @param {function} finished
         */
        9: function (parameters, finished) {
          var overallFeedback = parameters && parameters.overallFeedback;

          if (Array.isArray(overallFeedback)) {
            parameters.overallFeedback = {
              popupBackgroundColor: '#ffffff',
              feedbackTextColor: '#333333',
              overallFeedback: overallFeedback
            };
          }
          else if (
            overallFeedback &&
            typeof overallFeedback === 'object' &&
            !overallFeedback.popupBackgroundColor
          ) {
            overallFeedback.popupBackgroundColor = '#ffffff';
            if (!overallFeedback.feedbackTextColor) {
              overallFeedback.feedbackTextColor = '#333333';
            }
          }

          finished(null, parameters);
        },

        /**
         * Flatten nested overallFeedback range entries from the editor.
         *
         * @param {object} parameters
         * @param {function} finished
         */
        11: function (parameters, finished) {
          var overallFeedback = parameters && parameters.overallFeedback;
          var ranges;
          var i;
          var entry;

          if (!overallFeedback || !Array.isArray(overallFeedback.overallFeedback)) {
            finished(null, parameters);
            return;
          }

          ranges = [];
          for (i = 0; i < overallFeedback.overallFeedback.length; i++) {
            entry = overallFeedback.overallFeedback[i] || {};
            if (entry.overallFeedback && typeof entry.overallFeedback === 'object') {
              ranges.push(entry.overallFeedback);
            }
            else {
              ranges.push(entry);
            }
          }

          parameters.overallFeedback = {
            popupBackgroundColor: overallFeedback.popupBackgroundColor || '#ffffff',
            feedbackTextColor: overallFeedback.feedbackTextColor || '#333333',
            overallFeedback: ranges
          };

          finished(null, parameters);
        }
      }
    }
  };
})();
