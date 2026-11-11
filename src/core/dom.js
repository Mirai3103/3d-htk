/**
 * References to the static DOM declared in index.html. Import elements from here instead
 * of querying the DOM again.
 */

export const ROOT = document.documentElement;
export const appEl = document.getElementById('app');
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
export const walkToggle = document.getElementById('walk-toggle');
export const walkPlace = document.getElementById('walk-place');
export const walkPlaceKind = document.getElementById('walk-place-kind');
export const walkPlaceName = document.getElementById('walk-place-name');
export const npcPrompt = document.getElementById('npc-prompt');
export const npcBubble = document.getElementById('npc-bubble');
export const npcBubbleName = document.getElementById('npc-bubble-name');
export const npcBubbleStep = document.getElementById('npc-bubble-step');
export const npcBubbleClose = document.getElementById('npc-bubble-close');
export const npcBubbleNext = document.getElementById('npc-bubble-next');
export const npcBubbleTyped = document.getElementById('npc-bubble-typed');
export const npcBubbleRest = document.getElementById('npc-bubble-rest');
export const npcBubbleMore = document.getElementById('npc-bubble-more');
export const npcBubbleLive = document.getElementById('npc-bubble-live');
export const panelClose = document.getElementById('panel-close');
export const panelBack = document.getElementById('panel-back');

export const stageEl = document.getElementById('stage');

export const panelKind = infoPanel.querySelector('.panel-kind');
