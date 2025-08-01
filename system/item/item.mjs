import { RollType, AOVCheck, CardType } from "../apps/checks.mjs"
import { isCtrlKey } from "../apps/helper.mjs";


export class AOVItem extends Item {

  prepareData() {
    super.prepareData();
  }

  getRollData() {
    const rollData = { ...this.system };
    if (!this.actor) return rollData;
    rollData.actor = this.actor.getRollData();
    return rollData;
  }

  async roll(event) {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }

  static async createDialog(data={}, createOptions={}, { types, ...options }={}) {
    //Enter the document types you want to remove from the side bar create option - 'base' is removed in the super
    const invalid = ["wound", "family", "runescript", "seidur", "thrall","npcpower"];

    //TODO - remove when module ready
    if (!game.modules.get('aov-core-rulebook')?.active) {
      invalid.push('species','homeland','history')
    }
    //TODO

    if (!types) types = this.TYPES.filter(type => !invalid.includes(type));
    else types = types.filter(type => !invalid.includes(type));
    return super.createDialog(data, createOptions, { types, ...options });
  }

  async _preDelete(options, user) {
    if (this.parent) {
      const ids = this.parent.effects.filter(e => e.origin === this.uuid).map(e => e.id)
      if (ids.length) {
        await this.parent.deleteEmbeddedDocuments('ActiveEffect', ids)
      }
    }
    return super._preDelete(options, user);
  }

  /** @override */
  static async _onCreateOperation(documents, operation, user) {
    super._onCreateOperation(documents, operation, user)
    /* Copied from FoundryVTT v12 item.js replacing Actor with ActorDelta */
    if ( !(operation.parent instanceof ActorDelta) || !CONFIG.ActiveEffect.legacyTransferral || !user.isSelf ) return;
    const cls = getDocumentClass("ActiveEffect");

    // Create effect data
    const toCreate = [];
    for ( let item of documents ) {
      for ( let e of item.effects ) {
        if ( !e.transfer ) continue;
        const effectData = e.toJSON();
        effectData.origin = item.uuid;
        toCreate.push(effectData);
      }
    }

    // Asynchronously create transferred Active Effects
    operation = {...operation};
    delete operation.data;
    operation.renderSheet = false;
    // noinspection ES6MissingAwait
    cls.createDocuments(toCreate, operation);
  }

  //Handle clickable rolls from macros
  async roll() {
    const item = this;
    const actor = this.actor;
    let ctrlKey = isCtrlKey(event ?? false);
    let altKey = event.altKey;
    let shiftKey = event.shiftKey;
    let cardType = CardType.UNOPPOSED;
    let rollType = "";
    let skillId = "";
    let itemId = "";
    switch (item.type) {
      case 'passion':
        rollType = RollType.PASSION;
        skillId = item._id;
        if (ctrlKey) {
          cardType = CardType.AUGMENT
        } else if(event.altKey) {
          cardType = CardType.OPPOSED
        }
        break
      case 'skill':
        rollType = RollType.SKILL;
        skillId = item._id;
        if (ctrlKey) {
          cardType = CardType.AUGMENT
        } else if (event.altKey) {
          cardType = CardType.OPPOSED
        }
        break
      default:
        item.sheet.render(true);
        return
    }

      AOVCheck._trigger({
          rollType,
          cardType,
          shiftKey,
          skillId,
          itemId,
          event,
          actor,
          characteristic: false
      })

    return
  }

}

