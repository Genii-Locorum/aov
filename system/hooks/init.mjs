import { AOV } from "../setup/config.mjs";
import { AOVActor } from "../actor/actor.mjs";
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
    AOVItem
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

  CID.init()
  registerSheets()

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = true;
}
