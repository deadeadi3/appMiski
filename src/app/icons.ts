import { addIcons } from 'ionicons';
import {
  addOutline,
  chevronDownCircleOutline,
  eyeOutline,
  timeOutline,
  trophyOutline,
  cubeOutline,
  createOutline,
  trashOutline,
  ellipsisVertical,
  menuOutline,
  closeOutline,
  searchOutline,
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';

export function initializeIonicons() {
  addIcons({
    'add-outline': addOutline,
    'chevron-down-circle-outline': chevronDownCircleOutline,
    'eye-outline': eyeOutline,
    'time-outline': timeOutline,
    'trophy-outline': trophyOutline,
    'cube-outline': cubeOutline,
    'create-outline': createOutline,
    'trash-outline': trashOutline,
    'ellipsis-vertical': ellipsisVertical,
    'menu-outline': menuOutline,
    'close-outline': closeOutline,
    'search-outline': searchOutline,
    'settings-outline': settingsOutline,
    'log-out-outline': logOutOutline
  });
}
