import { AOV } from "../setup/config.mjs";
import { AOVActor } from "../actor/actor.mjs";
import { AOVClickableEvents } from '../apps/aov-clickable-events.js'
import { AOVItem } from "../item/item.mjs";
import { CID } from '../cid/cid.mjs'
import { handlebarsHelper } from '../setup/handlebar-helpers.mjs';
import { registerSettings } from '../settings/register-settings.mjs'
import { registerSheets } from '../setup/register-sheets.mjs'
import * as models from '../data/_module.mjs';
import { AOVActiveEffect } from "../apps/active-effects.mjs";

export default function Init() {
  //Add classes to global game object
  game.aov = {
    AOVActor,
    AOVItem,
    rollItemMacro,
    ClickRegionLeftUuid: AOVClickableEvents.ClickRegionLeftUuid,
    ClickRegionRightUuid: AOVClickableEvents.ClickRegionRightUuid,
    hasPermissionDocument: AOVClickableEvents.hasPermissionDocument,
    InSceneRelativeTeleport: AOVClickableEvents.InSceneRelativeTeleport,
    MapPinToggle: AOVClickableEvents.MapPinToggle,
    openDocument: AOVClickableEvents.openDocument,
    toggleTileJournalPages: AOVClickableEvents.toggleTileJournalPages,
    toScene: AOVClickableEvents.toScene
  }
  //Add Custom Configuration
  CONFIG.AOV = AOV;

  //Register Settings and Handlebar Helpers
  registerSettings();
  handlebarsHelper();

  // Define custom Document classes
  CONFIG.Item.documentClass = AOVItem;
  CONFIG.Actor.documentClass = AOVActor;
  CONFIG.ActiveEffect.documentClass = AOVActiveEffect;


  //Declare Data Models
  CONFIG.Actor.dataModels.character = models.AOVCharacterModel
  CONFIG.Actor.dataModels.npc = models.AOVNPCModel
  CONFIG.Actor.dataModels.farm = models.AOVFarmModel
  CONFIG.Actor.dataModels.ship = models.AOVShipModel
  CONFIG.Item.dataModels.devotion = models.AOVDevotionModel
  CONFIG.Item.dataModels.family = models.AOVFamilyModel
  CONFIG.Item.dataModels.gear = models.AOVGearModel
  CONFIG.Item.dataModels.hitloc = models.AOVHitLocModel
  CONFIG.Item.dataModels.passion = models.AOVPassionModel
  CONFIG.Item.dataModels.thrall = models.AOVThrallModel
  CONFIG.Item.dataModels.skill = models.AOVSkillModel
  CONFIG.Item.dataModels.weapon = models.AOVWeaponModel
  CONFIG.Item.dataModels.weaponCat = models.AOVWeaponCatModel
  CONFIG.Item.dataModels.wound = models.AOVWoundModel
  CONFIG.Item.dataModels.armour = models.AOVArmourModel
  CONFIG.Item.dataModels.rune = models.AOVRuneModel
  CONFIG.Item.dataModels.runescript = models.AOVRunescriptModel
  CONFIG.Item.dataModels.seidur = models.AOVSeidurModel
  CONFIG.Item.dataModels.npcpower = models.AOVNPCPowerModel
  CONFIG.Item.dataModels.species = models.AOVSpeciesModel
  CONFIG.Item.dataModels.homeland = models.AOVHomelandModel
  CONFIG.Item.dataModels.history = models.AOVHistoryModel

  CID.init()
  AOVClickableEvents.initSelf()
  registerSheets()

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = true;

  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (game.user) {
      createItemMacro(data, slot);
      return false;
    }
  });

}

//  Hotbar Macros
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(game.i18n.localize("AOV.noMacroItemOwner"));
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.aov.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command,
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "aov.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

//Create a Macro from an Item drop.
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        game.i18n.format("AOV.noMacroItemFound", { itemName }),
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
