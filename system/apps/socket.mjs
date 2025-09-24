import { AOVUtilities } from "./utilities.mjs";
import { RECard } from "../chat/resistance-chat.mjs";
import { AOVCheck } from "./checks.mjs";
import { COCard } from "../chat/combat-chat.mjs";
import { AOVCharCreate } from "../actor/charCreate.mjs";

export class AOVSystemSocket {

  static async callSocket(data) {
    //If a target (to) is specified then only carry this out if its this user
    if (!!data.to && game.userId !== data.to) {return}
    switch (data.type) {
      case 'updateChar':
        AOVUtilities.updateCharSheets(true);  //True locks the character sheet
        break;
      case 'healChar' :
        AOVUtilities.updateCharSheets(false);  //False doesn't lock the character sheet
      case 'REAdd':
        if (data.to === game.user.id) {
          RECard.REAdd(data.value.config, data.value.msgId);
        }
        break;
      case 'chatUpdate':
        if (data.to === game.user.id) {
          AOVCheck.handleChatButton(data.value);
        }
        break;
      case 'resolveDam':
        if (data.to === game.user.id) {
          COCard.resolveDam(data.value.config);
        }
        break;
      case 'resolveFum':
        if (data.to === game.user.id) {
          COCard.resolveFum(data.value.config);
        }
        break;
      case 'createFarm':
        if (data.to === game.user.id) {
          AOVCharCreate.farm(data.value.actor);
        }
        break
      case 'toggleMapNotes':
        game.settings.set('core', NotesLayer.TOGGLE_SETTING, data.toggle === true)
        break
    }
  }
}
