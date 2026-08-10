import "../styles/style.css";
import AdvancedBlanks from '../scripts/app';

// Load library (preserve PlayArea from scripts/play-area-scale.js)
H5P = H5P || {};
const PlayArea = H5P.AdvancedBlanksCFRD && H5P.AdvancedBlanksCFRD.PlayArea;
H5P.AdvancedBlanksCFRD = AdvancedBlanks;
if (PlayArea) {
  H5P.AdvancedBlanksCFRD.PlayArea = PlayArea;
}
