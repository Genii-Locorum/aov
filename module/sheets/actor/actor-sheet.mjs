const { api, sheets } = foundry.applications;
import { CIDEditor } from "../../cid/cid-editor.mjs";

export class AoVActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this._dragDrop = this._createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ['aov', 'sheet', 'actor'],
    position: {
      width: 600,
      height: 750
    },
    tag: "form",
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      editCid: this._onEditCid,
      viewDoc: this._viewDoc,
      toggleLock: this._toggleLock,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
    }
  }


  //Add CID Editor Button as seperate icon on the Window header
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);
    //define CID button
    const sheetCID = this.actor.flags?.aov?.cidFlag;
    const noId = (typeof sheetCID === 'undefined' || typeof sheetCID.id === 'undefined' || sheetCID.id === '');
    //add button
    const label = game.i18n.localize("AOV.CIDFlag.id");
    const cidEditor = `<button type="button" class="header-control icon fa-solid fa-fingerprint ${noId ? 'edit-cid-warning' : 'edit-cid-exisiting'}"
        data-action="editCid" data-tooltip="${label}" aria-label="${label}"></button>`;
    let el = this.window.close;
    while (el.previousElementSibling.localName === 'button') {
      el = el.previousElementSibling;
    }
    el.insertAdjacentHTML("beforebegin", cidEditor);
    return frame;
  }

  
  async _prepareContext(options) {
    return {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      actor: this.actor,
      flags: this.actor.flags,
      isGM: game.user.isGM,
      fields: this.document.schema.fields,
      config: CONFIG.AOV,
      system: this.actor.system,
      isLocked: this.actor.system.locked,
      isToken: this.actor.isToken,
    };
  }

  //------------ACTIONS-------------------

  // Change Image
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 39,
      left: this.position.left + 9,
    });
    return fp.browse();
  }

  // Handle editCid action
  static _onEditCid(event) {
    event.stopPropagation(); // Don't trigger other events
    if ( event.detail > 1 ) return; // Ignore repeated clicks
    new CIDEditor({document: this.document}, {}).render(true, { focus: true })
  }

  // View Embedded Document 
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  //Delete Embedded Document
  static async _deleteDoc(event, target) {
    if (event.detail === 2) {
      const doc = this._getEmbeddedDocument(target);
      await doc.delete();
    }
  }

  //Get Embedded Document
  _getEmbeddedDocument(target) {
    const docRow = target.closest('li[data-document-class]');
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  static _toggleLock(event) {
    event.stopPropagation();
    this.actor.update({'system.locked': !this.actor.system.locked})
  }

  //Create an Embedded Document
  static async _createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // Ignore data attributes that are reserved for action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }
    // Create the embedded document
    const newItem = await docCls.create(docData, { parent: this.actor });

    //And in certain circumstances render the new item sheet
      if (['gear'].includes(newItem.type)) {
       newItem.sheet.render(true);
    }
   
    //Add default CID to the item
    if(game.settings.get('aov', "actorItemCID")) {
      let key = await game.system.api.cid.guessId(newItem)
      await newItem.update({'flags.aov.cidFlag.id': key,
                            'flags.aov.cidFlag.lang': game.i18n.lang,
                            'flags.aov.cidFlag.priority': 0})
      const html = $(newItem.sheet.element).find('header.window-header .edit-cid-warning,header.window-header .edit-cid-exisiting')
      if (html.length) {
        html.css({
          color: (key ? 'orange' : 'red')
        })
      }
    newItem.sheet.render();
    }


  }

  
  //----------------

  //Implement Game Settings for Colours etc
  static renderSheet (sheet,html) {
    if (game.settings.get('aov', 'primaryFontColour')) {
      document.body.style.setProperty('--primary-font-colour', game.settings.get('aov', 'primaryFontColour'));
    }

    if (game.settings.get('aov', 'secondaryFontColour')) {
      document.body.style.setProperty('--secondary-font-colour', game.settings.get('aov', 'secondaryFontColour'));
    }

    if (game.settings.get('aov', 'primaryBackColour')) {
      document.body.style.setProperty('--primary-back-colour', game.settings.get('aov', 'primaryBackColour'));
    }
        
    if (game.settings.get('aov', 'secondaryBackColour')) {
      document.body.style.setProperty('--secondary-back-colour', game.settings.get('aov', 'secondaryBackColour'));
    }        

    if (game.settings.get('aov', 'primaryFont')) {
      let fontSource="url(/"+game.settings.get('aov', 'primaryFont')+")"
      const primaryFont = new FontFace(
        'primaryFont',
        fontSource
      )
      primaryFont
        .load()
        .then(function (loadedFace) {document.fonts.add(loadedFace)})
        .catch(function (error) {
          ui.notifications.error(error)
        })
        document.body.style.setProperty('--primary-font', 'primaryFont');
      }
  }

//-------------Drag and Drop--------------

  // Define whether a user is able to begin a dragstart workflow for a given drag selector
  _canDragStart(selector) {
    return this.isEditable;
  }

  //Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
  _canDragDrop(selector) {
    return this.isEditable;
  }

  //Callback actions which occur at the beginning of a drag start workflow.
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;
    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();
    if (!dragData) return;
    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  //Callback actions which occur when a dragged element is over a drop target.
  _onDragOver(event) {}

  //Callback actions which occur when a dragged element is dropped on a target.
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  //Handle the dropping of ActiveEffect data onto an Actor Sheet
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  //Handle dropping of an Actor data onto another Actor sheet
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  //Handle dropping of an item reference or item data onto an Actor Sheet
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);
    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  //Handle dropping of a Folder on an Actor Sheet.
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  //Handle the final creation of dropped Item data on the Actor.
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  //Returns an array of DragDrop instances
  get dragDrop() {
    return this._dragDrop;
  }

  _dragDrop;

  //Create drag-and-drop workflow handlers for this Application
  _createDragDropHandlers() {
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
      return new foundry.applications.ux.DragDrop(d);
    });
  }



}    