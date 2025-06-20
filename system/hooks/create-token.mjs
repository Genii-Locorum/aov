import { AOVActor } from "../actor/actor.mjs"
/* global Dialog, game, ui */
export default function (document, options, userId) {
  // Only token creator can roll
  if (game.user.id !== userId) return
  // Set token icon correctly
  if (
    document.texture.src === 'icons/svg/mystery-man.svg' &&
    document.texture.src !== document._object.actor.img) {
    document.texture.src = document._object.actor.img
  }

  // If there is something to roll ask if we should roll it
  if (document._object.actor.type !== 'character' && (document._object.actor.hasRollableCharacteristics)) {
    switch (game.settings.get('aov', 'tokenDropMode')) {
      case 'ask':
       const choice = AOVActor.dropChoice(document, options)
        break

      case 'roll':
        document._object.actor.rollCharacteristicsValue()
        ui.notifications.info(game.i18n.format('AOV.TokenCreationRoll.Rolled', { name: document.object.actor.name }))
        document._object.actor.locked = true
        break

      case 'average':
        document._object.actor.averageCharacteristicsValue()
        ui.notifications.info(game.i18n.format('AOV.TokenCreationRoll.Averaged', { name: document.object.actor.name }))
        document._object.actor.locked = true
        break

      case 'ignore':
        break
    }
  }
}    