import { AOVDisplaySettings } from "./settings-displayOptions.mjs";
import { AOVCIDSettings } from "./settings-cidOptions.mjs";
import { AOVGameYearSettings } from "./settings-gameYear.mjs";
import { AOVNPCSettings } from "./settings-npcOptions.mjs";

export async function registerSettings() {
  //Game Year Settings Button
  game.settings.registerMenu('aov', 'gameYearSettings', {
    name: 'AOV.Settings.gameYearSettingsHint',
    label: 'AOV.Settings.gameYearSettings',
    icon: 'fas fa-calendar-days',
    type: AOVGameYearSettings,
    restricted: true
  })
  AOVGameYearSettings.registerSettings()

  //NPC Settings Button
  game.settings.registerMenu('aov', 'npcSettings', {
    name: 'AOV.Settings.npcSettingsHint',
    label: 'AOV.Settings.npcSettings',
    icon: 'fas fa-hydra',
    type: AOVNPCSettings,
    restricted: true
  })
  AOVNPCSettings.registerSettings()

  //Display Settings Button
  game.settings.registerMenu('aov', 'displayOptions', {
    name: 'AOV.Settings.displayOptionsHint',
    label: 'AOV.Settings.displayOptions',
    icon: 'fas fa-palette',
    type: AOVDisplaySettings,
    restricted: false
  })
  AOVDisplaySettings.registerSettings()

  //Chaosium ID Settings Button
  game.settings.registerMenu('aov', 'cidOptions', {
    name: 'AOV.Settings.cidOptionsHint',
    label: 'AOV.Settings.cidOptions',
    icon: 'fas fa-fingerprint',
    type: AOVCIDSettings,
    restricted: true
  })
  AOVCIDSettings.registerSettings()


  //Invisible Settings
  game.settings.register('aov', 'developmentEnabled', {
    name: 'Development phased allowed',
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  })

  game.settings.register('aov', 'xpEnabled', {
    name: 'Enable XP gain',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  })

  game.settings.register('aov', 'systemVersion', {
    name: 'AoV System Version',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  })
}
