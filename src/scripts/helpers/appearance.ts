/**
 * Activity appearance: CSS custom properties for Advanced Blanks CFRD.
 */

export interface AppearanceDefaults {
  playAreaBackground: string;
  blankBackground: string;
  blankText: string;
  blankBorderColor: string;
  blankBorderWidth: number;
  blankBorderRadius: number;
  blankFocusBorderColor: string;
  blankFocusBoxShadow: string;
  blankFocusBorderColorActive: string;
  selectArrowIcon: string;
  selectArrowImage: string;
  selectListBackground: string;
  selectListText: string;
  selectListHoverBackground: string;
  selectListHoverText: string;
  selectListSelectedBackground: string;
  selectListSelectedText: string;
  feedbackBackground: string;
  feedbackTextColor: string;
  clozeColor: string;
  clozeFontSize: number;
  contextText: string;
  contextFontSize: number;
  correctBackground: string;
  correctBorderColor: string;
  correctText: string;
  wrongBackground: string;
  wrongBorderColor: string;
  wrongText: string;
  retryBackground: string;
  retryBorderColor: string;
  retryText: string;
  scrollbarWidth: number;
  scrollbarShowTrack: boolean;
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

const APPEARANCE_DEFAULTS: AppearanceDefaults = {
  playAreaBackground: '#ffffff',
  blankBackground: '#ffffff',
  blankText: '#333333',
  blankBorderColor: '#a0a0a0',
  blankBorderWidth: 1,
  blankBorderRadius: 0.25,
  blankFocusBorderColor: '#7fb8ff',
  blankFocusBoxShadow: '0 0 0.5em 0 #7fb8ff',
  blankFocusBorderColorActive: '#7fb8ff',
  selectArrowIcon: 'caret',
  selectArrowImage: 'none',
  selectListBackground: '#ffffff',
  selectListText: '#333333',
  selectListHoverBackground: '#e8f4ff',
  selectListHoverText: '#333333',
  selectListSelectedBackground: '#333333',
  selectListSelectedText: '#ffffff',
  feedbackBackground: '#ffffff',
  feedbackTextColor: '#333333',
  clozeColor: '#333333',
  clozeFontSize: 1,
  contextText: '#555555',
  contextFontSize: 1,
  correctBackground: '#9dd8bb',
  correctBorderColor: '#9dd8bb',
  correctText: '#255c41',
  wrongBackground: '#f7d0d0',
  wrongBorderColor: '#f7d0d0',
  wrongText: '#b71c1c',
  retryBackground: '#ffff99',
  retryBorderColor: '#ffff99',
  retryText: '#000000',
  scrollbarWidth: 8,
  scrollbarShowTrack: true,
  scrollbarTrack: '#e8e8e8',
  scrollbarThumb: '#b0b0b0',
  scrollbarThumbHover: '#888888'
};

const CSS_VAR_KEYS: { [key: string]: string } = {
  playAreaBackground: '--ab-play-area-bg',
  blankBackground: '--ab-blank-bg',
  blankText: '--ab-blank-color',
  blankBorderColor: '--ab-blank-border-color',
  blankFocusBorderColor: '--ab-blank-focus-border-color',
  blankFocusBoxShadow: '--ab-blank-focus-box-shadow',
  blankFocusBorderColorActive: '--ab-blank-focus-border-color-active',
  selectArrowImage: '--ab-select-arrow-image',
  selectListBackground: '--ab-select-list-bg',
  selectListText: '--ab-select-list-color',
  selectListHoverBackground: '--ab-select-list-hover-bg',
  selectListHoverText: '--ab-select-list-hover-color',
  selectListSelectedBackground: '--ab-select-list-selected-bg',
  selectListSelectedText: '--ab-select-list-selected-color',
  feedbackBackground: '--ab-feedback-bg',
  feedbackTextColor: '--ab-feedback-color',
  clozeColor: '--ab-cloze-color',
  contextText: '--ab-context-color',
  correctBackground: '--ab-correct-bg',
  correctBorderColor: '--ab-correct-border-color',
  correctText: '--ab-correct-color',
  wrongBackground: '--ab-wrong-bg',
  wrongBorderColor: '--ab-wrong-border-color',
  wrongText: '--ab-wrong-color',
  retryBackground: '--ab-retry-bg',
  retryBorderColor: '--ab-retry-border-color',
  retryText: '--ab-retry-color',
  scrollbarTrack: '--ab-scrollbar-track',
  scrollbarThumb: '--ab-scrollbar-thumb',
  scrollbarThumbHover: '--ab-scrollbar-thumb-hover'
};

const CSS_EM_VAR_KEYS: { [key: string]: string } = {
  blankBorderRadius: '--ab-blank-border-radius',
  clozeFontSize: '--ab-cloze-font-size',
  contextFontSize: '--ab-context-font-size'
};

const CSS_PX_VAR_KEYS: { [key: string]: string } = {
  blankBorderWidth: '--ab-blank-border-width',
  scrollbarWidth: '--ab-scrollbar-width'
};

function toEm(value: any, fallback: number): string {
  let num = (value !== undefined && value !== null && value !== '')
    ? Number(value)
    : Number(fallback);
  if (isNaN(num)) {
    num = Number(fallback);
  }
  return num + 'em';
}

function toPx(value: any, fallback: number): string {
  let num = (value !== undefined && value !== null && value !== '')
    ? Number(value)
    : Number(fallback);
  if (isNaN(num)) {
    num = Number(fallback);
  }
  return num + 'px';
}

function isTruthy(value: any): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function pickString(value: any, fallback: string): string {
  return (value === undefined || value === null || value === '')
    ? fallback
    : String(value);
}

function normalizeAngle(value: any, fallback: number): number {
  let normalized = parseInt(value, 10);
  if (isNaN(normalized)) {
    normalized = fallback;
  }
  return Math.max(0, Math.min(360, normalized));
}

function buildLinearGradient(angle: number, colorStart: string, colorEnd: string): string {
  return 'linear-gradient(' + angle + 'deg, ' + colorStart + ', ' + colorEnd + ')';
}

function resolveFill(group: any, options: {
  solidKey: string;
  fallbackSolid: string;
  useGradientKey?: string;
  gradientKey?: string;
}): string {
  const useGradientKey = options.useGradientKey || 'useGradientBackground';
  const gradientKey = options.gradientKey || 'gradientBackground';
  const solid = pickString(group && group[options.solidKey], options.fallbackSolid);

  if (!isTruthy(group && group[useGradientKey])) {
    return solid;
  }

  const gradient = (group && group[gradientKey]) || {};
  const angle = normalizeAngle(gradient.angle, 180);
  const colorStart = pickString(gradient.colorStart, solid);
  const colorEnd = pickString(gradient.colorEnd, colorStart);
  return buildLinearGradient(angle, colorStart, colorEnd);
}

function resolveBorderSolid(group: any, solidKey: string, fallbackSolid: string): string {
  const solid = pickString(group && group[solidKey], fallbackSolid);
  if (!isTruthy(group && group.useGradientBackground)) {
    return solid;
  }
  const gradient = (group && group.gradientBackground) || {};
  return pickString(gradient.colorStart, solid);
}

function isInvisibleColor(color: any): boolean {
  if (color === undefined || color === null || color === '') {
    return true;
  }
  const value = String(color).trim().toLowerCase();
  if (value === 'transparent') {
    return true;
  }
  return /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0(?:\.0+)?\s*\)$/i.test(value);
}

function resolveUseBorder(group: any, defaultUseBorder: boolean): boolean {
  if (!group) {
    return defaultUseBorder;
  }
  const hasExplicit =
    group.useBorder === true || group.useBorder === false ||
    group.useBorder === 0 || group.useBorder === 1 ||
    group.useBorder === '0' || group.useBorder === '1' ||
    group.useBorder === 'true' || group.useBorder === 'false';

  if (hasExplicit) {
    return isTruthy(group.useBorder);
  }

  if (group.borderColor !== undefined && group.borderColor !== null && group.borderColor !== '') {
    return !isInvisibleColor(group.borderColor);
  }

  return defaultUseBorder;
}

function resolveUseFocusBorder(group: any, defaultValue: boolean): boolean {
  if (!group) {
    return defaultValue;
  }
  const hasExplicit =
    group.useFocusBorder === true || group.useFocusBorder === false ||
    group.useFocusBorder === 0 || group.useFocusBorder === 1 ||
    group.useFocusBorder === '0' || group.useFocusBorder === '1' ||
    group.useFocusBorder === 'true' || group.useFocusBorder === 'false';

  if (hasExplicit) {
    return isTruthy(group.useFocusBorder);
  }

  return defaultValue;
}

/**
 * Build a data-URI SVG arrow for the closed select control.
 */
function buildSelectArrowImage(icon: string, color: string): string {
  const fill = pickString(color, APPEARANCE_DEFAULTS.blankText);
  let svg: string;

  switch (icon) {
    case 'chevron':
      svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">' +
        '<path d="M4 6 L10 12 L16 6" stroke="' + fill +
        '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      break;
    case 'angle':
      svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">' +
        '<path d="M6 8 L10 12 L14 8" stroke="' + fill +
        '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      break;
    case 'none':
      return 'none';
    case 'caret':
    default:
      svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">' +
        '<path fill="' + fill + '" d="M5 7.5 L15 7.5 L10 14 Z"/></svg>';
      break;
  }

  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

function getFeedbackColors(overallFeedback: any): { feedbackBackground: string; feedbackTextColor: string } {
  const QC = (H5P as any).QuestionCFRD;
  const config = (QC && QC.normalizeOverallFeedbackConfig)
    ? QC.normalizeOverallFeedbackConfig(overallFeedback)
    : {
        popupBackgroundColor: '#ffffff',
        feedbackTextColor: '#333333'
      };

  return {
    feedbackBackground: config.popupBackgroundColor || '#ffffff',
    feedbackTextColor: config.feedbackTextColor || '#333333'
  };
}

function readAppearanceFields(appearance: any, overallFeedback?: any): Partial<AppearanceDefaults> {
  const blanks = (appearance && appearance.blankColors) || {};
  const selectDropdown = blanks.selectDropdown || {};
  const text = (appearance && appearance.textStyle) || {};
  const correct = (appearance && appearance.correctColors) || {};
  const wrong = (appearance && appearance.wrongColors) || {};
  const retry = (appearance && appearance.retryColors) || {};
  const scrollbar = (appearance && appearance.scrollbar) || {};
  const useBorder = resolveUseBorder(blanks, true);
  const useFocusBorder = resolveUseFocusBorder(blanks, true);
  const blankText = pickString(blanks.text, APPEARANCE_DEFAULTS.blankText);
  const focusColor = pickString(blanks.focusBorderColor, APPEARANCE_DEFAULTS.blankFocusBorderColor);
  const selectArrowIcon = pickString(blanks.selectArrowIcon, APPEARANCE_DEFAULTS.selectArrowIcon);

  return {
    playAreaBackground: appearance && appearance.playAreaBackground,
    blankBackground: resolveFill(blanks, {
      solidKey: 'background',
      fallbackSolid: APPEARANCE_DEFAULTS.blankBackground
    }),
    blankText: blanks.text,
    blankBorderColor: useBorder
      ? pickString(blanks.borderColor, APPEARANCE_DEFAULTS.blankBorderColor)
      : 'transparent',
    blankBorderWidth: useBorder ? 1 : 0,
    blankBorderRadius: blanks.borderRadius,
    blankFocusBorderColor: focusColor,
    blankFocusBoxShadow: useFocusBorder ? ('0 0 0.5em 0 ' + focusColor) : 'none',
    blankFocusBorderColorActive: useFocusBorder
      ? focusColor
      : (useBorder
        ? pickString(blanks.borderColor, APPEARANCE_DEFAULTS.blankBorderColor)
        : 'transparent'),
    selectArrowIcon: selectArrowIcon,
    selectArrowImage: buildSelectArrowImage(selectArrowIcon, blankText),
    selectListBackground: pickString(selectDropdown.background, APPEARANCE_DEFAULTS.selectListBackground),
    selectListText: pickString(selectDropdown.text, APPEARANCE_DEFAULTS.selectListText),
    selectListHoverBackground: pickString(selectDropdown.hoverBackground, APPEARANCE_DEFAULTS.selectListHoverBackground),
    selectListHoverText: pickString(selectDropdown.hoverText, APPEARANCE_DEFAULTS.selectListHoverText),
    selectListSelectedBackground: pickString(selectDropdown.selectedBackground, APPEARANCE_DEFAULTS.selectListSelectedBackground),
    selectListSelectedText: pickString(selectDropdown.selectedText, APPEARANCE_DEFAULTS.selectListSelectedText),
    feedbackBackground: getFeedbackColors(overallFeedback).feedbackBackground,
    feedbackTextColor: getFeedbackColors(overallFeedback).feedbackTextColor,
    clozeColor: text.clozeColor,
    clozeFontSize: text.clozeFontSize,
    contextText: text.contextColor,
    contextFontSize: text.contextFontSize,
    correctBackground: resolveFill(correct, {
      solidKey: 'background',
      fallbackSolid: APPEARANCE_DEFAULTS.correctBackground
    }),
    correctBorderColor: pickString(
      correct.borderColor,
      resolveBorderSolid(correct, 'background', APPEARANCE_DEFAULTS.correctBorderColor)
    ),
    correctText: correct.text,
    wrongBackground: resolveFill(wrong, {
      solidKey: 'background',
      fallbackSolid: APPEARANCE_DEFAULTS.wrongBackground
    }),
    wrongBorderColor: pickString(
      wrong.borderColor,
      resolveBorderSolid(wrong, 'background', APPEARANCE_DEFAULTS.wrongBorderColor)
    ),
    wrongText: wrong.text,
    retryBackground: resolveFill(retry, {
      solidKey: 'background',
      fallbackSolid: APPEARANCE_DEFAULTS.retryBackground
    }),
    retryBorderColor: pickString(
      retry.borderColor,
      resolveBorderSolid(retry, 'background', APPEARANCE_DEFAULTS.retryBorderColor)
    ),
    retryText: retry.text,
    scrollbarWidth: scrollbar.width,
    scrollbarShowTrack: scrollbar.showTrack,
    scrollbarTrack: scrollbar.track,
    scrollbarThumb: scrollbar.thumb,
    scrollbarThumbHover: scrollbar.thumbHover
  };
}

function mergeAppearance(appearance: any, overallFeedback?: any): AppearanceDefaults {
  const merged: any = {};
  const fields = readAppearanceFields(appearance, overallFeedback);
  let key: string;

  for (key in APPEARANCE_DEFAULTS) {
    if (Object.prototype.hasOwnProperty.call(APPEARANCE_DEFAULTS, key)) {
      merged[key] = (APPEARANCE_DEFAULTS as any)[key];
    }
  }

  for (key in fields) {
    if (
      Object.prototype.hasOwnProperty.call(fields, key) &&
      (fields as any)[key] !== undefined &&
      (fields as any)[key] !== null &&
      (fields as any)[key] !== ''
    ) {
      merged[key] = (fields as any)[key];
    }
  }

  if (fields.scrollbarShowTrack === false || fields.scrollbarShowTrack === true) {
    merged.scrollbarShowTrack = fields.scrollbarShowTrack;
  }

  if (fields.blankBorderWidth === 0 || fields.blankBorderWidth === 1) {
    merged.blankBorderWidth = fields.blankBorderWidth;
  }

  // Recompute focus + arrow after merge so defaults + overrides stay consistent
  const blanks = (appearance && appearance.blankColors) || {};
  const useFocusBorder = resolveUseFocusBorder(blanks, true);
  const useBorder = resolveUseBorder(blanks, true);
  const focusColor = pickString(merged.blankFocusBorderColor, APPEARANCE_DEFAULTS.blankFocusBorderColor);
  merged.blankFocusBoxShadow = useFocusBorder ? ('0 0 0.5em 0 ' + focusColor) : 'none';
  merged.blankFocusBorderColorActive = useFocusBorder
    ? focusColor
    : (useBorder ? merged.blankBorderColor : 'transparent');
  merged.selectArrowIcon = pickString(merged.selectArrowIcon, APPEARANCE_DEFAULTS.selectArrowIcon);
  merged.selectArrowImage = buildSelectArrowImage(
    merged.selectArrowIcon,
    pickString(merged.blankText, APPEARANCE_DEFAULTS.blankText)
  );

  const feedbackColors = getFeedbackColors(overallFeedback);
  merged.feedbackBackground = feedbackColors.feedbackBackground;
  merged.feedbackTextColor = feedbackColors.feedbackTextColor;

  if (merged.scrollbarShowTrack === false) {
    merged.scrollbarTrack = 'transparent';
  }

  return merged as AppearanceDefaults;
}

function getCssVarValue(merged: AppearanceDefaults, key: string): string {
  if (Object.prototype.hasOwnProperty.call(CSS_EM_VAR_KEYS, key)) {
    return toEm((merged as any)[key], (APPEARANCE_DEFAULTS as any)[key]);
  }
  if (Object.prototype.hasOwnProperty.call(CSS_PX_VAR_KEYS, key)) {
    return toPx((merged as any)[key], (APPEARANCE_DEFAULTS as any)[key]);
  }
  return (merged as any)[key];
}

function applyVarsToElement(el: HTMLElement, merged: AppearanceDefaults): void {
  let key: string;
  for (key in CSS_VAR_KEYS) {
    if (Object.prototype.hasOwnProperty.call(CSS_VAR_KEYS, key)) {
      el.style.setProperty(CSS_VAR_KEYS[key], getCssVarValue(merged, key));
    }
  }
  for (key in CSS_EM_VAR_KEYS) {
    if (Object.prototype.hasOwnProperty.call(CSS_EM_VAR_KEYS, key)) {
      el.style.setProperty(CSS_EM_VAR_KEYS[key], getCssVarValue(merged, key));
    }
  }
  for (key in CSS_PX_VAR_KEYS) {
    if (Object.prototype.hasOwnProperty.call(CSS_PX_VAR_KEYS, key)) {
      el.style.setProperty(CSS_PX_VAR_KEYS[key], getCssVarValue(merged, key));
    }
  }
}

export function applyAppearanceVars($container: any, appearance: any, overallFeedback?: any): AppearanceDefaults {
  const merged = mergeAppearance(appearance, overallFeedback);
  if (!$container || !$container.length) {
    return merged;
  }

  for (let i = 0; i < $container.length; i++) {
    const el = $container[i];
    if (el && el.style) {
      applyVarsToElement(el, merged);
    }
  }

  return merged;
}

export function applyPlayAreaRootBackground($root: any, appearance: any, overallFeedback?: any): AppearanceDefaults {
  const merged = mergeAppearance(appearance, overallFeedback);
  const bg = merged.playAreaBackground;

  if (!$root || !$root.length) {
    return merged;
  }

  for (let i = 0; i < $root.length; i++) {
    const el = $root[i];
    if (!el || !el.style) {
      continue;
    }
    el.style.setProperty('--ab-play-area-bg', bg);
    el.style.backgroundColor = bg;
  }

  return merged;
}

export function scheduleAppearance($container: any, appearance: any, overallFeedback?: any): void {
  const apply = () => {
    applyAppearanceVars($container, appearance, overallFeedback);
  };
  apply();
  setTimeout(apply, 0);
  setTimeout(apply, 50);
  setTimeout(apply, 200);
}

export function schedulePlayAreaRootBackground($root: any, appearance: any, overallFeedback?: any): void {
  const apply = () => {
    applyPlayAreaRootBackground($root, appearance, overallFeedback);
  };
  apply();
  setTimeout(apply, 0);
  setTimeout(apply, 50);
  setTimeout(apply, 200);
}

/**
 * Apply CSS vars + QuestionCFRD action button styles on an Advanced Blanks instance.
 */
export function applyActivityAppearance(instance: any): void {
  if (!instance) {
    return;
  }

  const appearance =
    (instance.options && instance.options.appearance) ||
    (instance.params && instance.params.appearance);
  const overallFeedback =
    (instance.options && instance.options.overallFeedback) ||
    (instance.params && instance.params.overallFeedback);

  if (instance.$playArea && instance.$playArea.length) {
    scheduleAppearance(instance.$playArea, appearance, overallFeedback);
  }

  if (instance.$container && instance.$container.length) {
    schedulePlayAreaRootBackground(instance.$container, appearance, overallFeedback);
  }

  const actionButtons = appearance && appearance.actionButtons;
  if (
    actionButtons &&
    typeof instance.setActionButtonAppearance === 'function' &&
    (H5P as any).QuestionCFRD &&
    (H5P as any).QuestionCFRD.hasActionButtonAppearance &&
    (H5P as any).QuestionCFRD.hasActionButtonAppearance(actionButtons)
  ) {
    instance.setActionButtonAppearance(actionButtons);
  }
}
