import { AoVItemSheet } from "./base-item-sheet.mjs"

export class AoVPassionSheet extends AoVItemSheet {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['passion'],
  }

  static PARTS = {
    header: { template: 'systems/aov/templates/item/item.header.hbs' },
    tabs: { template: 'systems/aov/templates/generic/tab-navigation.hbs' },
    details: { template: 'systems/aov/templates/item/passion.detail.hbs' },
    description: { template: 'systems/aov/templates/item/item.description.hbs' },
    gmTab: { template: 'systems/aov/templates/item/item.gmtab.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    context.system.total = Number(context.system.base ?? 0) + Number(context.system.home ?? 0) + Number(context.system.history ?? 0) + Number(context.system.family ?? 0) + Number(context.system.xp ?? 0);

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

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Only show GM tab if you are GM
    options.parts = ['header', 'tabs', 'details','description'];
    if (game.user.isGM) {
        options.parts.push('gmTab');
    }
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
  }


  //-----------------------ACTIONS-----------------------------------





}
