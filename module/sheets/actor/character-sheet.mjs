import { AoVActorSheet} from "./actor-sheet.mjs"

export class AoVCharacterSheet extends AoVActorSheet {
  constructor (options = {}) {
    super(options)
    //this.#dragDrop = this.#createDragDropHandlers();
  }
  
  static DEFAULT_OPTIONS = {
    classes: ['character'],
  }

  static PARTS = {
    header: {template: 'systems/aov/templates/actor/character.header.hbs'},
    tabs: {template: 'systems/aov/templates/generic/tab-navigation.hbs'},
    gear: {template: 'systems/aov/templates/actor/character.gear.hbs'},
    attributes: {template: 'systems/aov/templates/actor/character.attributes.hbs'},
    description: {template: 'systems/aov/templates/actor/character.description.hbs'},
    gmTab: {template: 'systems/aov/templates/actor/character.gmtab.hbs'},
  }  

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
  }  

  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'gear';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'AOV.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          tab.tooltip="tooltip";
          break;
        case 'gear':
          tab.id = 'gear';
          tab.label += 'gear';
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

  async _prepareContext (options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    
    await this._prepareItems(context);    
    return context
  }  

 /** @override */
 async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
      case 'gear' :  
        context.tab = context.tabs[partId];
        break;
      case 'description':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.actor.system.description,
          {
            async: true,
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        break;
        case 'gmTab':
          context.tab = context.tabs[partId];
          context.enrichedGMNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.actor.system.gmNotes,
            {
              async: true,
              secrets: this.document.isOwner,
              rollData: this.actor.getRollData(),
              relativeTo: this.actor,
            }
          );
          break;  
    }
    return context;
  }

  //Handle Actor's Items
  _prepareItems(context) {
    const gear = [];
 
    for (let itm of this.document.items) {
     if (itm.type === 'gear') {
       gear.push(itm);
     }
    }
    context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }  



  //Activate event listeners using the prepared sheet HTML
  _onRender (context, _options) {
    this._dragDrop.forEach((d) => d.bind(this.element));
    this.element.querySelectorAll('.actor-toggle').forEach(n => n.addEventListener("dblclick", this.#onActorToggle.bind(this)));
    this.element.querySelectorAll('.item-quantity').forEach(n => n.addEventListener("change", this.#editQty.bind(this)))
    this.element.querySelectorAll('.item-toggle').forEach(n => n.addEventListener("click", this.#onItemToggle.bind(this)))
  }



  //--------------ACTIONS-------------------



  //--------------LISTENERS------------------
  //Handle Actor Toggles
  async #onActorToggle (event){
  }

  async #editQty (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const newQuantity = event.currentTarget.value;
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.update({ 'system.quantity': newQuantity });
  }

  async #onItemToggle (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    let checkProp={};
    const prop = event.currentTarget.dataset.prop;
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (prop === 'equipStatus') {
      let newVal = item.system.equipStatus + 1
      if (newVal>3) {newVal=1}
      checkProp = {'system.equipStatus' : newVal}
    } else {return}
    item.update(checkProp);
  }



  
}    