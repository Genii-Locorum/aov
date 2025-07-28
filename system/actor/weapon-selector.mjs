import AOVDialog from "../setup/aov-dialog.mjs"

export class WeaponSelectDialog extends AOVDialog {

  _onRender(context, _options) {
    this.element.querySelectorAll('.selector').forEach(n => n.addEventListener("change", this._onSelectClicked.bind(this)))
  }

  async _onSelectClicked(event) {
    const form = event.currentTarget.closest('.weapon-select')
    const chosen = event.currentTarget.closest('.selector')
    let defaultVal = "xxx"
    let devotion = this.options.data.selectOptions.filter(i=>i.id === chosen.value)[0]

    let tempScore = 0
    for (let counter = 1; counter<=this.options.data.picks; counter++) {
      const newTarget = form.querySelector(".option-" + counter);
      if (newTarget.value === devotion.id) {
        tempScore = tempScore + Number(newTarget.dataset.adj)
      }
    }

    //Calculate number of options used/selected
    let used = 0
    for (let counter = 1; counter<=this.options.data.picks; counter++) {
      const newTarget = form.querySelector(".option-" + counter);
      if (defaultVal != newTarget.value) {used++}
    }


    //Update seletected score
    this.options.data.added = used
    const divCount = form.querySelector('.count')
    divCount.innerText = this.options.data.added
  }


  static async create(selectOptions) {
    let destination = 'systems/aov/templates/dialog/weaponSelect.hbs';
    let winTitle = game.i18n.format("AOV.selectItem", { type: game.i18n.localize("TYPES.Item.weapon")});
    let data = {
      selectOptions,
      added: 0,
      picks: 2
    }
    const html = await foundry.applications.handlebars.renderTemplate(destination, data);

    return new Promise(resolve => {
      const dlg = WeaponSelectDialog.wait(
        {
          window: { title: winTitle },
          form: {closeOnSubmit: false },
          title: winTitle,
          content: html,
          data,
          buttons:[{
            label: game.i18n.localize("AOV.confirm"),
            callback: (event, button, dialog) => {
              if (dialog.options.data.added < dialog.options.data.picks) {
                button.disabled = true
              } else {
              dialog.options.form.closeOnSubmit = true
              return resolve(button.form.elements)
              }
            }
          }],
        }
      )

    })
     return dlg
  }
}

