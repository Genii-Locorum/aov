import { AoVItemSheet } from "./base-item-sheet.mjs"
import { AOVSelectLists } from "../../apps/select-lists.mjs"

export class AoVWeaponSheet extends AoVItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['weapon'],
    position: {
      width: 600,
      height: 620
    },
  }

  static PARTS = {
    header: { template: 'systems/aov/templates/item/item.header.hbs' },
    tabs: { template: 'systems/aov/templates/generic/tab-navigation.hbs' },
    details: { template: 'systems/aov/templates/item/weapon.detail.hbs' },
    description: { template: 'systems/aov/templates/item/item.description.hbs' },
    gmTab: { template: 'systems/aov/templates/item/item.gmtab.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    context.weaponCatOptions = await AOVSelectLists.getWeaponCategories();
    if (context.system.weaponCat) {
      let weaponCat = await game.aov.cid.fromCID(context.system.weaponCat);
      context.weaponCatName = weaponCat[0].name ?? ""
    } else {
      context.weaponCatName = ""
    }
    context.weaponTypeOptions = await AOVSelectLists.weaponType()
    context.weaponTypeName = game.i18n.localize("AOV." + context.system.weaponType);
    context.weaponSkillsList = await AOVSelectLists.getWeaponSkills()
    if (context.system.skillCID) {
      let weaponSkill = await game.aov.cid.fromCID(context.system.skillCID);
      context.weaponSkillName = weaponSkill[0].name ?? ""
    } else {
      context.weaponSkillName = ""
    }
    context.damTypeList = await AOVSelectLists.dmgTypeOptions()
    context.damTypeName = game.i18n.localize('AOV.DamType.' + context.system.damType)
    context.damModList = await AOVSelectLists.damModOptions()
    context.damModName = game.i18n.localize('AOV.DamMod.' + context.system.damMod)
    context.equippedOptions = await AOVSelectLists.equippedOptions(this.document.type)
    context.isRange = false
    if (['missile','thrown'].includes(context.system.weaponType)) {
      context.isRange = true
    }

    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
        context.tab = context.tabs[partId];
        break;
      case 'description':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.document.getRollData(),
            relativeTo: this.document,
          }
        );
        break;
      case 'gmTab':
        context.tab = context.tabs[partId];
        context.enrichedGMNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.item.system.gmNotes,
          {
            secrets: this.document.isOwner,
            rollData: this.document.getRollData(),
            relativeTo: this.document,
          }
        );
        break;
    }
    return context;
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Only show GM tab if you are GM
    options.parts = ['header', 'tabs', 'details','description'];
    if (game.user.isGM) {
        options.parts.push('gmTab');
    }
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
    //Default tab
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'details';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        id: '',
        icon: '',
        label: 'AOV.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'details':
          tab.id = 'details';
          tab.label += 'details';
          break;
        case 'description':
          tab.id = 'description';
          tab.label += 'description';
          break;
        case 'gmTab':
          tab.id = 'gmTab';
          tab.label += 'gmTab';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }


  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    this.element.querySelectorAll('.weapon-type').forEach(n => n.addEventListener("change", this.#weaponType.bind(this)))
  }




  //-----------------------ACTIONS-----------------------------------

  //--------------LISTENERS------------------
  //Handle Change in Weapon Type
  async #weaponType(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    let newWpnType = event.target.value
    let newDamMod = "d"
    if (newWpnType === 'thrown') {
      newDamMod = "h"
    } else if (newWpnType === 'missile') {
      newDamMod = "n"
    }
    await this.item.update({'system.damMod': newDamMod,
                           'system.weaponType': newWpnType
    })
  }



}
