import { MessageService } from '../services/message-service';
import { BlankLoader } from '../content-loaders/blank-loader';
import { ClozeLoader } from '../content-loaders/cloze-loader';
import { Cloze } from "../models/cloze";
import { IDataRepository } from "../services/data-repository";
import { ISettings } from "../services/settings";
import { H5PLocalization } from "../services/localization";
import { ClozeType, SelectAlternatives } from "../models/enums";
import { Highlight } from "../models/highlight";
import { Blank } from "../models/blank";
import { Correctness } from '../models/answer';

import highlightTemplate from '../views/highlight.ractive.html';
import blankTemplate from '../views/blank.ractive.html';

import * as RactiveEventsKeys from '../../lib/ractive-events-keys';

interface ScoreChanged {
  (score: number, maxScore: number): void;
}

interface AutoChecked {
  (): void;
}

interface Solved {
  (): void;
}

interface Typed {
  (): void;
}

interface TextChanged {
  () : void;
}

export class ClozeController {
  private jquery: JQuery;

  private cloze: Cloze;
  private isSelectCloze: boolean;
  private selectOutsideBound: boolean = false;
  private selectRepositionBound: boolean = false;

  public onScoreChanged: ScoreChanged;
  public onAutoChecked: AutoChecked;
  public onSolved: Solved;
  public onTyped: Typed;
  public onTextChanged: TextChanged;

  // Storage of the ractive objects that link models and views
  private highlightRactives: { [id: string]: Ractive.Ractive } = {};
  private blankRactives: { [id: string]: Ractive.Ractive } = {};

  public get maxScore(): number {
    return this.cloze.blanks.length;
  }

  /**
   * Detect whether there are blanks with more than one solution.
   * @return {boolean} True if there is at least one blank with more than one solution.
   */
  public get hasAlternatives(): boolean {
    return this.cloze.blanks.some(b => b.correctAnswers[0].alternatives.length > 1);
  }

  public get currentScore(): number {
    const score = this.cloze.blanks.reduce((score, b) => {
      const notShowingSolution = !b.isShowingSolution;
      const correctAnswerGiven = b.correctAnswers[0].alternatives.indexOf(b.enteredText || '') !== -1;

      // Detect small mistakes
      const closeCorrectMatches = b.correctAnswers
        .map(answer => answer.evaluateAttempt(b.enteredText))
        .filter(evaluation => evaluation.correctness === Correctness.CloseMatch);
      const similarAnswerGiven = this.settings.acceptSpellingErrors && closeCorrectMatches.length > 0;

      return score += (notShowingSolution && (correctAnswerGiven || similarAnswerGiven)) ? 1 : 0;
    }, 0);

    return Math.max(0, score);
  }

  public get allBlanksEntered() {
    if (this.cloze)
      return this.cloze.blanks.every(blank => blank.isError || blank.isCorrect || blank.isRetry);
    return false;
  }

  public get isSolved(): boolean {
    return this.cloze.isSolved;
  }

  public get isFilledOut() {
    if (!this.cloze || this.cloze.blanks.length === 0)
      return true;
    return this.cloze.blanks.some(b => b.enteredText !== '');
  }

  public get isFullyFilledOut() {
    if (!this.cloze || this.cloze.blanks.length === 0)
      return true;
    return this.cloze.blanks.every(b => b.enteredText !== '');
  }

  constructor(private repository: IDataRepository, private settings: ISettings, private localization: H5PLocalization, private MessageService: MessageService) {
  }

  /**
   * Sets up all blanks, the cloze itself and the ractive bindings.
   * @param  {HTMLElement} root
   */
  initialize(root: HTMLElement, jquery: JQuery) {
    this.jquery = jquery;
    this.isSelectCloze = this.settings.clozeType === ClozeType.Select ? true : false;

    var blanks = this.repository.getBlanks();

    // Stop ractive debug mode
    Ractive.DEBUG = false;

    if (this.isSelectCloze && this.settings.selectAlternatives === SelectAlternatives.All) {
      for (var blank of blanks) {
        let otherBlanks = blanks.filter(v => v !== blank);
        blank.loadChoicesFromOtherBlanks(otherBlanks);
      }
    }

    var snippets = this.repository.getSnippets();
    blanks.forEach(blank => BlankLoader.instance.replaceSnippets(blank, snippets));

    this.cloze = ClozeLoader.createCloze(this.repository.getClozeText(), blanks);

    var containers = this.createAndAddContainers(root);
    containers.cloze.innerHTML = this.cloze.html;
    this.createRactiveBindings();
  }

  checkAll = () => {
    this.cloze.hideAllHighlights();
    this.closeAllSelects();
    for (var blank of this.cloze.blanks) {
      if ((!blank.isCorrect) && blank.enteredText !== "")
        blank.evaluateAttempt(true, true);
      if (this.isSelectCloze) {
        blank.selectInteractionLocked = true;
        blank.closeSelect();
      }
    }
    this.refreshCloze();
    this.checkAndNotifyCompleteness();
  }

  textTyped = (event, blank: Blank) => {
    blank.onTyped();
    if (this.onTyped)
      this.onTyped();
    this.refreshCloze();
  }

  focus = (event, blank: Blank) => {
    blank.onFocused();
    this.refreshCloze();
  }

  displayFeedback = (event, blank: Blank) => {
    blank.onDisplayFeedback();
    this.refreshCloze();
  }

  showHint = (event, blank: Blank) => {
    this.cloze.hideAllHighlights();
    blank.showHint();
    this.refreshCloze();
  }

  requestCloseTooltip = (event, blank: Blank) => {
    blank.removeTooltip();
    this.refreshCloze();
    this.jquery.find("#" + blank.id).focus();
  }

  private getNativeEvent(event: any): any {
    if (!event) {
      return null;
    }
    return event.original || event.event || event;
  }

  private stopEvent(event: any): void {
    const native = this.getNativeEvent(event);
    if (native) {
      if (typeof native.preventDefault === 'function') {
        native.preventDefault();
      }
      if (typeof native.stopPropagation === 'function') {
        native.stopPropagation();
      }
    }
  }

  private closeAllSelects(except?: Blank): boolean {
    let closed = false;
    if (!this.cloze) {
      return false;
    }
    for (const blank of this.cloze.blanks) {
      if (except && blank === except) {
        continue;
      }
      if (blank.selectOpen) {
        blank.closeSelect();
        closed = true;
      }
    }
    return closed;
  }

  private getOpenSelectBlank(): Blank | null {
    if (!this.cloze) {
      return null;
    }
    for (const blank of this.cloze.blanks) {
      if (blank.selectOpen) {
        return blank;
      }
    }
    return null;
  }

  private ensureSelectListeners(): void {
    if (!this.selectOutsideBound) {
      this.selectOutsideBound = true;
      document.addEventListener('mousedown', this.onSelectOutsidePointer, true);
    }
    if (!this.selectRepositionBound) {
      this.selectRepositionBound = true;
      window.addEventListener('resize', this.onSelectViewportChange, true);
      window.addEventListener('scroll', this.onSelectViewportChange, true);
    }
  }

  private onSelectOutsidePointer = (event: Event) => {
    const openBlank = this.getOpenSelectBlank();
    if (!openBlank) {
      return;
    }

    const target = event.target as Node;
    const wrapper = this.jquery.find('#container_' + openBlank.id)[0]
      || this.jquery.find('#' + openBlank.id).closest('.blank')[0]
      || this.jquery.find('#' + openBlank.id).closest('.h5p-ab-custom-select')[0];

    if (wrapper && wrapper.contains(target)) {
      return;
    }

    openBlank.closeSelect();
    this.refreshCloze();
  };

  private onSelectViewportChange = () => {
    const openBlank = this.getOpenSelectBlank();
    if (!openBlank) {
      return;
    }
    this.positionSelectList(openBlank);
    const ractive = this.blankRactives[openBlank.id];
    if (ractive) {
      ractive.set('blank.selectListStyle', openBlank.selectListStyle);
      ractive.set('blank.selectOpenUp', openBlank.selectOpenUp);
    }
  };

  private positionSelectList(blank: Blank): void {
    const trigger = this.jquery.find('#' + blank.id)[0] as HTMLElement;
    if (!trigger) {
      blank.selectListStyle = '';
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const maxListHeight = 14 * 16;
    const estimatedHeight = Math.min(
      maxListHeight,
      Math.max(blank.choices.length, 1) * 28
    );
    const viewportPadding = 8;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    blank.selectOpenUp = openUp;

    const parts = [
      'position:fixed',
      'left:' + Math.round(rect.left) + 'px',
      'width:' + Math.round(rect.width) + 'px',
      'z-index:10000',
      'max-height:' + maxListHeight + 'px'
    ];

    if (openUp) {
      parts.push('top:auto');
      parts.push('bottom:' + Math.round(window.innerHeight - rect.top + 4) + 'px');
    }
    else {
      parts.push('bottom:auto');
      parts.push('top:' + Math.round(rect.bottom + 4) + 'px');
    }

    blank.selectListStyle = parts.join(';') + ';';
  }

  private openSelect(blank: Blank): void {
    if (blank.isSelectDisabled()) {
      return;
    }

    this.closeAllSelects(blank);
    blank.selectOpen = true;
    const selectedIndex = blank.choices.indexOf(blank.enteredText);
    blank.selectHighlightIndex = selectedIndex >= 0 ? selectedIndex : 0;
    this.ensureSelectListeners();
    this.positionSelectList(blank);
    this.refreshCloze();

    setTimeout(() => {
      if (!blank.selectOpen) {
        return;
      }
      this.positionSelectList(blank);
      const ractive = this.blankRactives[blank.id];
      if (ractive) {
        ractive.set('blank.selectListStyle', blank.selectListStyle);
        ractive.set('blank.selectOpenUp', blank.selectOpenUp);
      }
    }, 0);
  }

  toggleSelect = (event, blank: Blank) => {
    this.stopEvent(event);

    if (blank.isSelectDisabled()) {
      return;
    }

    if (blank.selectOpen) {
      blank.closeSelect();
      this.refreshCloze();
      return;
    }

    this.openSelect(blank);
  }

  selectListPointer = (event) => {
    // Keep mousedown inside the list from blurring / outside-closing before click.
    this.stopEvent(event);
  }

  selectChoice = (event, blank: Blank, choice: string) => {
    this.stopEvent(event);

    if (blank.isSelectDisabled()) {
      return;
    }

    blank.enteredText = choice == null ? '' : String(choice);
    blank.closeSelect();
    this.refreshCloze();
    this.checkBlank(event, blank, 'change');

    const trigger = this.jquery.find('#' + blank.id)[0] as HTMLElement;
    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus();
    }
  }

  selectKeydown = (event, blank: Blank) => {
    const native = this.getNativeEvent(event);
    if (!native) {
      return;
    }

    const key = native.key || native.keyCode;
    const isSpace = key === ' ' || key === 'Spacebar' || key === 32;
    const isEnter = key === 'Enter' || key === 13;
    const isEscape = key === 'Escape' || key === 'Esc' || key === 27;
    const isDown = key === 'ArrowDown' || key === 40;
    const isUp = key === 'ArrowUp' || key === 38;
    const isHome = key === 'Home' || key === 36;
    const isEnd = key === 'End' || key === 35;

    if (blank.isSelectDisabled()) {
      return;
    }

    if (!blank.selectOpen && (isEnter || isSpace || isDown || isUp)) {
      this.stopEvent(event);
      this.openSelect(blank);
      return;
    }

    if (!blank.selectOpen) {
      return;
    }

    if (isEscape) {
      this.stopEvent(event);
      blank.closeSelect();
      this.refreshCloze();
      return;
    }

    if (isDown || isUp || isHome || isEnd) {
      this.stopEvent(event);
      const last = Math.max(0, blank.choices.length - 1);
      let index = blank.selectHighlightIndex;

      if (isDown) {
        index = Math.min(last, index + 1);
      }
      else if (isUp) {
        index = Math.max(0, index - 1);
      }
      else if (isHome) {
        index = 0;
      }
      else {
        index = last;
      }

      blank.selectHighlightIndex = index;
      this.refreshCloze();
      return;
    }

    if (isEnter || isSpace) {
      this.stopEvent(event);
      const choice = blank.choices[blank.selectHighlightIndex];
      this.selectChoice(event, blank, choice);
      if (isEnter) {
        this.checkBlank(event, blank, 'enter');
      }
    }
  }

  checkBlank = (event, blank: Blank, cause: string) => {
    if ((cause === 'blur' || cause === 'change')) {
      blank.lostFocus();
    }

    if (cause === 'change' && this.onTyped) {
      this.onTyped();
    }

    if (this.settings.autoCheck) {
      if (!blank.enteredText || blank.enteredText === "")
        return;

      this.cloze.hideAllHighlights();
      blank.evaluateAttempt(false);
      this.checkAndNotifyCompleteness();
      this.refreshCloze();
      this.onAutoChecked();
    }
    if ((cause === 'enter')
      && ((this.settings.autoCheck && blank.isCorrect && !this.isSolved)
        || !this.settings.autoCheck)) {
      // move to next blank
      var index = this.cloze.blanks.indexOf(blank);
      var nextId;
      while (index < this.cloze.blanks.length - 1 && !nextId) {
        index++;
        if (!this.cloze.blanks[index].isCorrect)
          nextId = this.cloze.blanks[index].id;
      }

      if (nextId)
        this.jquery.find("#" + nextId).focus();
    }
  }

  reset = () => {
    this.closeAllSelects();
    this.cloze.reset();
    this.refreshCloze();
  }

  showSolutions = () => {
    this.closeAllSelects();
    this.cloze.showSolutions();
    if (this.isSelectCloze) {
      for (const blank of this.cloze.blanks) {
        blank.selectInteractionLocked = true;
        blank.closeSelect();
      }
    }
    this.refreshCloze();
  }

  private createAndAddContainers(addTo: HTMLElement): { cloze: HTMLDivElement } {
    var clozeContainerElement = document.createElement('div');
    clozeContainerElement.id = 'h5p-cloze-container';
    if (this.settings.clozeType === ClozeType.Select) {
      clozeContainerElement.className = 'h5p-advanced-blanks-select-mode';
    } else {
      clozeContainerElement.className = 'h5p-advanced-blanks-type-mode';
    }
    addTo.appendChild(clozeContainerElement);

    return {
      cloze: clozeContainerElement
    };
  }

  private createHighlightBinding(highlight: Highlight) {
    this.highlightRactives[highlight.id] = new Ractive({
      el: '#container_' + highlight.id,
      template: highlightTemplate,
      data: {
        object: highlight
      }
    });
  }

  private createBlankBinding(blank: Blank) {
    var ractive = new Ractive({
      el: '#container_' + blank.id,
      template: blankTemplate,
      data: {
        isSelectCloze: this.isSelectCloze,
        blank: blank
      },
      events: {
        enter: RactiveEventsKeys.enter,
        escape: RactiveEventsKeys.escape,
        anykey: RactiveEventsKeys.anykey
      }
    });
    ractive.on("checkBlank", this.checkBlank);
    ractive.on("showHint", this.showHint);
    ractive.on("textTyped", this.textTyped);
    ractive.on("textChanged", this.onTextChanged);
    ractive.on("closeMessage", this.requestCloseTooltip);
    ractive.on("focus", this.focus);
    ractive.on("displayFeedback", this.displayFeedback);
    ractive.on("toggleSelect", this.toggleSelect);
    ractive.on("selectChoice", this.selectChoice);
    ractive.on("selectKeydown", this.selectKeydown);
    ractive.on("selectListPointer", this.selectListPointer);

    this.blankRactives[blank.id] = ractive;
  }

  private createRactiveBindings() {
    for (var highlight of this.cloze.highlights) {
      this.createHighlightBinding(highlight);
    }

    for (var blank of this.cloze.blanks) {
      this.createBlankBinding(blank);
    }
  }

  /**
   * Updates all views of highlights and blanks. Can be called when a model
   * was changed
   */
  private refreshCloze() {
    for (var highlight of this.cloze.highlights) {
      var highlightRactive = this.highlightRactives[highlight.id];
      highlightRactive.set("object", highlight);
    }

    for (var blank of this.cloze.blanks) {
      var blankRactive = this.blankRactives[blank.id];
      blankRactive.set("blank", blank);
    }
  }

  private checkAndNotifyCompleteness = (): boolean => {
    if (this.onScoreChanged)
      this.onScoreChanged(this.currentScore, this.maxScore);

    if (this.cloze.isSolved) {
      if (this.onSolved)
        this.onSolved();
      return true;
    }

    return false;
  }

  public serializeCloze(): string[] {
    return this.cloze.serialize();
  }

  public deserializeCloze(data: any): boolean {
    if (!this.cloze || !data)
      return false;
    this.cloze.deserialize(data);
    this.refreshCloze();
    return true;
  }

  public getCorrectAnswerList(): string[][] {
    if (!this.cloze || this.cloze.blanks.length === 0)
      return [[]];
    let result = [];
    for (var blank of this.cloze.blanks) {
      result.push(blank.getCorrectAnswers());
    }

    return result;
  }
}
