import { AoVItemSheet } from "./base-item-sheet.mjs"
import { AOVUtilities } from "../../apps/utilities.mjs"
import { AOVCharCreate } from "../../actor/charCreate.mjs"

export class AoVHomelandSheet extends AoVItemSheet {
  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  static DEFAULT_OPTIONS = {
    classes: ['homeland'],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.droppable' }],
    position: {
      height: 635
    },
  }

  static PARTS = {
    header: {
      template: 'systems/aov/templates/item/item.header.hbs' },
    tabs: { template: 'systems/aov/templates/generic/tab-navigation.hbs' },
    details: {
      template: 'systems/aov/templates/item/homeland.detail.hbs',
      scrollable: ['']
     },
    description: { template: 'systems/aov/templates/item/item.description.hbs' },
    gmTab: { template: 'systems/aov/templates/item/item.gmtab.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.tabs = this._getTabs(options.parts);
    const skills = [];
    context.hasSkills = false
    for (let skill of context.system.skills) {
      context.hasSkills = true
      let tempLoc = (await game.aov.cid.fromCIDBest({ cid: skill.cid }))[0]
      if (tempLoc) {
        skills.push({ uuid: skill.uuid, cid: skill.cid, name: tempLoc.name})
      } else {
        skills.push({ uuid: skill.uuid, cid: skill.cid, name: game.i18n.localize("AOV.invalid")})
      }
    }

    const passions = [];
    context.hasPassions = false
    for (let passion of context.system.passions) {
      context.hasPassions = true
      let tempLoc = (await game.aov.cid.fromCIDBest({ cid: passion.cid }))[0]
      if (tempLoc) {
        passions.push({ uuid: passion.uuid, cid: passion.cid, name: tempLoc.name})
      } else {
        passions.push({ uuid: passion.uuid, cid: passion.cid, name: game.i18n.localize("AOV.invalid")})
      }
    }

    const equipment = [];
    context.hasEquip = false
    for (let equip of context.system.equipment) {
      context.hasEquip = true
      let tempLoc = (await game.aov.cid.fromCIDBest({ cid: equip.cid }))[0]
      if (tempLoc) {
        equipment.push({ uuid: equip.uuid, cid: equip.cid, name: tempLoc.name})
      } else {
        equipment.push({ uuid: equip.uuid, cid: equip.cid, name: game.i18n.localize("AOV.invalid")})
      }
    }

    const historyTables = [];
    context.hasTables = false
    for (let histTable of context.system.historyToday) {
      context.hasTables = true
      let tempLoc = (await game.aov.cid.fromCIDBest({ cid: histTable.cid }))[0]
      if (tempLoc) {
        historyTables.push({ uuid: histTable.uuid, cid: histTable.cid, name: tempLoc.name, label:game.i18n.localize('AOV.' + histTable.historyType)})
      } else {
        historyTables.push({ uuid: histTable.uuid, cid: histTable.cid, name: game.i18n.localize("AOV.invalid"), label:game.i18n.localize('AOV.' + histTable.historyType)})
      }
    }

    //Sort History by CID
    historyTables.sort(function (a, b) {
      let x = a.cid;
      let y = b.cid;
      if (x < y) { return -1 };
      if (x > y) { return 1 };
      return 0;
    })


    context.skills = skills.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.passions = passions.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.equipment = equipment.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.historyTables = historyTables

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
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))
    this.element.querySelectorAll('.item-delete').forEach(n => n.addEventListener("dblclick", this.#onItemDelete.bind(this)))
    this.element.querySelectorAll('.item-view').forEach(n => n.addEventListener("click", this.#onItemView.bind(this)))
  }

  //-----------------------ACTIONS-----------------------------------



  //Allow for a skill being dragged and dropped on to the species sheet
  async _onDrop(event, type = 'skill', collectionName = 'skills') {
    event.preventDefault()
    event.stopPropagation()
    let datalistType = "Item"
    if (event?.currentTarget?.classList?.contains('passions')) {
      type = "passion";
      collectionName = "passions";
    } else if (event?.currentTarget?.classList?.contains('equipment')) {
      type = "armour";
      collectionName = "equipment";
    } else if (event?.currentTarget?.classList?.contains('historyToday')) {
      collectionName = "historyToday";
      datalistType = "RollTable"
    }

    const dataList = await AOVUtilities.getDataFromDropEvent(event, datalistType)
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
    const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []


    for (const item of dataList) {
      if (collectionName === 'historyToday') {
        //This is ok - keep going
      } else if (!item || !item.system) {
        continue
      } else if (['weapon','armour','gear'].includes(item.type) && collectionName === 'equipment') {
        //allow us to proceed
      } else if (![type].includes(item.type)) { continue }

      //Dropping in item list - check the item doesn't already exist
      if (collection.find(el => el.cid === item.flags.aov.cidFlag.id)) {
        ui.notifications.warn(game.i18n.format('AOV.ErrorMsg.dupItem', { itemName: (item.name +"(" + item.flags.aov.cidFlag.id +")") }));
        continue
      }

      let historyType = "";
      if (['historyToday'].includes(collectionName)) {
        historyType = await AOVCharCreate.askHistory()
      }



      collection.push({ uuid: item.uuid, cid: item.flags.aov.cidFlag.id, historyType: historyType})

    }
    await this.item.update({ [`system.${collectionName}`]: collection })
    return
  }

  //Delete's a skill in the main  list
  async #onItemDelete(event, collectionName = 'skills') {
    event.preventDefault();
    event.stopImmediatePropagation();
    collectionName = event.currentTarget.dataset.coll
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i.uuid === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
    }
  }


  //View a skill from the main list
  async #onItemView(event) {
    const item = $(event.currentTarget).closest('.item')
    const cid = item.data('cid')
    let tempItem = (await game.aov.cid.fromCIDBest({ cid: cid }))[0]
    if (tempItem) { tempItem.sheet.render(true) };
  }



 // DragDrop
 //
 //

  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }


  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  _onDragOver(event) {}



   async _onDropItem(event, data) {
    if (!this.item.isOwner) return false;
  }

   async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

   get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

   #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

}
