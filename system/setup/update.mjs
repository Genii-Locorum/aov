/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs.
 * @param {object} [options={}]
 * @param {boolean} [options.bypassVersionCheck=false]  Bypass certain migration restrictions gated behind system
 *                                                      version stored in item stats.
 * @returns {Promise}      A Promise which resolves once the migration is completed
 */
export async function updateWorld({ bypassVersionCheck = false } = {}) {
  const currentVersion = game.settings.get("aov", "systemVersion");
  const targetVersion = game.system.version;

  if (currentVersion === "") {
    await updateDialog('systems/aov/templates/updates/welcome.hbs')
  } else {
    //Message if current system is less that Version 13.1
    if (foundry.utils.isNewerVersion('13.1', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.1.hbs')
    }

    //Message if current system is less that Version 13.4
    if (foundry.utils.isNewerVersion('13.4', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.4.hbs')
    }

    //Message if current system is less that Version 13.5
    if (foundry.utils.isNewerVersion('13.5', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.5.hbs')
    }

    //Message if current system is less that Version 13.6
    if (foundry.utils.isNewerVersion('13.6', currentVersion ?? '0')) {
      let response = await updateDialog('systems/aov/templates/updates/update13.6.hbs')
      if (!response) {
        ui.notifications.warn("Item Migration to Version 13.6 cancelled");
        return
      }
      await damTypeUpdate()
    }

    //Message if current system is less that Version 13.7
    if (foundry.utils.isNewerVersion('13.7', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.7.hbs')
    }

    //Message if current system is less that Version 13.8
    if (foundry.utils.isNewerVersion('13.8', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.8.hbs')
    }

    //Message if current system is less that Version 13.9
    if (foundry.utils.isNewerVersion('13.9', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.9.hbs')
    }

    //Message if current system is less that Version 13.10
    if (foundry.utils.isNewerVersion('13.10', currentVersion ?? '0')) {
      let response = await updateDialog('systems/aov/templates/updates/update13.10.hbs')
      if (!response) {
        ui.notifications.warn("Item Migration to Version 13.10 cancelled");
        return
      }
      await charStartStats()
    }

    //Message if current system is less that Version 13.12
    if (foundry.utils.isNewerVersion('13.12', currentVersion ?? '0')) {
      let response = await updateDialog('systems/aov/templates/updates/update13.12.hbs')
      if (!response) {
        ui.notifications.warn("Item Migration to Version 13.12 cancelled");
        return
      }
      await skillNameUpdate()
    }

    //Message if current system is less that Version 13.13
    if (foundry.utils.isNewerVersion('13.13', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.13.hbs')
    }

    //Message if current system is less that Version 13.14
    if (foundry.utils.isNewerVersion('13.14', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.14.hbs')
    }

    //Message if current system is less that Version 13.15
    if (foundry.utils.isNewerVersion('13.15', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.15.hbs')
    }

    //Message if current system is less that Version 13.16
    if (foundry.utils.isNewerVersion('13.16', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.16.hbs')
    }

    //Message if current system is less that Version 13.17
    if (foundry.utils.isNewerVersion('13.17', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.17.hbs')
    }

    //Message if current system is less that Version 13.18
    if (foundry.utils.isNewerVersion('13.18', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.18.hbs')
    }

    //Message if current system is less that Version 13.19
    if (foundry.utils.isNewerVersion('13.19', currentVersion ?? '0')) {
      await updateDialog('systems/aov/templates/updates/update13.19.hbs')
    }

  }

  await game.settings.set("aov", "systemVersion", targetVersion);
}

export async function updateDialog(msg) {
  const content = await foundry.applications.handlebars.renderTemplate(msg)
  const response = await foundry.applications.api.DialogV2.prompt({
    position: {
      width: 500,
      height: 450,
    },
    classes: ['aov', 'item'],
    window: {
      title: "Update",
    },
    content,
    modal: true
  })
  return response
}

export async function damTypeUpdate() {
  //Update World Items
  for (let item of game.items) {
    if (item.type != 'weapon') { continue }
    if (item.system.weaponType === 'missile') {
      await item.update({ 'system.damMod': "n" })
    } else if (item.system.weaponType === 'thrown') {
      await item.update({ 'system.damMod': "h" })
    }
  }

  //Update Items in World Actors
  for (let actor of game.actors) {
    for (let item of actor.items) {
      if (item.type != 'weapon') { continue }
      if (item.system.weaponType === 'missile') {
        await item.update({ 'system.damMod': "n" })
      } else if (item.system.weaponType === 'thrown') {
        await item.update({ 'system.damMod': "h" })
      }
    }
  }


  // Update Items in  Scenes [Token] Actors
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (token.actorLink) { continue }
      for (let item of token.delta.items) {
        if (item.type != 'weapon') { continue }
        if (item.system.weaponType === 'missile') {
          await item.update({ 'system.damMod': "n" })
        } else if (item.system.weaponType === 'thrown') {
          await item.update({ 'system.damMod': "h" })
        }
      }
    }
  }
  return
}

export async function charStartStats() {
  //Update Items in World Actors
  for (let actor of game.actors) {
    if (actor.type != 'character') {continue}
    let changes = {}
    for (let [key, ability] of Object.entries(actor.system.abilities)) {
      let formula = "3D6"
      let min = 3
      let max = 21
      if (['int', 'siz'].includes(key)) {
        formula = "2D6+6"
        min = 8
      }
      if (actor.system.abilities[key].formula === "") {
        changes = Object.assign(changes, {
          [`system.abilities.${key}.formula`]: formula,
          [`system.abilities.${key}.min`]: min,
          [`system.abilities.${key}.max`]: max
        })
      }
    }
    await actor.update(changes)
  }
}

export async function skillNameUpdate() {
  console.log("Skill Name Update")
  //Update Items in World
  for (let item of game.items) {
    if (item.type != 'skill') {continue}
    if (item.system.mainName != "") {continue}
      console.log(item.name)
      item.update ({'system.mainName': item.name})
  }
  //Update Skills in Actors
  for (let actor of game.actors) {
    for (let item of actor.items) {
      if (item.type != 'skill') {continue}
      if (item.system.mainName != "") {continue}
        console.log(item.name)
        item.update ({'system.mainName': item.name})
    }
  }
  // Update Items in  Scenes [Token] Actors
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (token.actorLink) { continue }
      for (let item of token.delta.items) {
        if (item.type != 'skill') { continue }
        if (item.system.mainName != "") {continue}
          console.log(item.name)
          item.update ({'system.mainName': item.name})
      }
    }
  }

}

