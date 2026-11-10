/**
 * References to the static DOM declared in index.html. Import elements from here instead
 * of querying the DOM again.
 */

export const ROOT = document.documentElement;
export const loader = document.getElementById('loader');
export const loaderStatus = document.getElementById('loader-status');
export const labelsLayer = document.getElementById('labels');
export const infoPanel = document.getElementById('info-panel');
export const panelIndex = document.getElementById('panel-index');
export const panelName = document.getElementById('panel-name');
export const panelSub = document.getElementById('panel-sub');
export const panelArea = document.getElementById('panel-area');
export const panelLevels = document.getElementById('panel-levels');
export const panelDescription = document.getElementById('panel-description');
export const labelsToggle = document.getElementById('labels-toggle');
export const overviewBtn = document.getElementById('overview-btn');
export const panelClose = document.getElementById('panel-close');
export const panelBack = document.getElementById('panel-back');

export const stageEl = document.getElementById('stage');

export const panelKind = infoPanel.querySelector('.panel-kind');
