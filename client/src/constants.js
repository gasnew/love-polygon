// @flow

// NOTE: create-react-app does not allow importing outside of src/, so we have
// to keep these up-to-date with server/constants.js
export const PLAYER_COUNT_MIN = 3;
export const PLAYER_COUNT_MAX = 6;
export const NAME_LIMIT = 12;
export const ROUND_COUNT = 3;
export const VALID_SESSION_ID_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const SESSION_ID_LENGTH = 4;

// COLORS (can be client-side only)
export const COLORS = {
  RED: '#f6b6bb',
  GREEN: '#9fe68a',
  TEAL: '#77eeda',
  YELLOW: '#f6e8b6',
  BLUE: '#b6c7f6',
  PURPLE: '#d8b6f6',
  GRAY: '#F5F5F5',
};
