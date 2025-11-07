import { AoVItemSheet } from "./base-item-sheet.mjs"
import { AOVSelectLists } from "../../apps/select-lists.mjs"
import { AOVActiveEffectSheet } from "../../sheets/aov-active-effect-sheet.mjs"

export class AoVWoundSheet extends AoVItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['wound'],
    position: {
      width: 600,
      height: 350
    },
  }

  static PARTS = {
    header: { template: 'systems/aov/templates/item/item.header.hbs' },
    tabs: { template: 'systems/aov/templates/generic/tab-navigation.hbs' },
    details: { template: 'systems/aov/templates/item/wound.detail.hbs' },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);

    if (context.hasOwner) {
      let actorId = this.item.parent._id
      let actor = await game.actors.get(actorId)
      if (!actor) {
        actor = await fromUuid(this.item.parent.uuid)
      }
      context.hitLocs = await AOVSelectLists.getHitLocOptions(actor)
    }
    context.effects = AOVActiveEffectSheet.getItemEffectsFromSheet(this.document)
    const changesActiveEffects = AOVActiveEffectSheet.getEffectChangesFromSheet(this.document)
    context.effectKeys = changesActiveEffects.effectKeys
    context.effectChanges = changesActiveEffects.effectChanges
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
        context.tab = context.tabs[partId];
        break;
    }
    return context;
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
       }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }


  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
  }


  //-----------------------ACTIONS-----------------------------------





}
