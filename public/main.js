import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { utilService } from './services/util.service.js'

console.log('Simple driver to test some API calls')

window.onLoadToys = onLoadToys
window.onLoadUsers = onLoadUsers
window.onAddToy = onAddToy
window.onGetToyById = onGetToyById
window.onRemoveToy = onRemoveToy
window.onAddToyMsg = onAddToyMsg

async function onLoadToys() {
    const toys = await toyService.query()
    render('Toys', toys)
}
async function onLoadUsers() {
    const users = await userService.query()
    render('Users', users)
}

async function onGetToyById() {
    const id = prompt('Toy id?')
    if (!id) return
    const toy = await toyService.getById(id)
    render('Toy', toy)
}

async function onRemoveToy() {
    const id = prompt('Toy id?')
    if (!id) return
    await toyService.remove(id)
    render('Removed Toy')
}

async function onAddToy() {
    await userService.login({ username: 'puki', password: 'secret' })
    const savedToy = await toyService.save(toyService.getEmptyToy())
    render('Saved Toy', savedToy)
}

async function onAddToyMsg() {
    await userService.login({ username: 'puki', password: 'secret' })
    const id = prompt('Toy id?')
    if (!id) return

    const savedMsg = await toyService.addToyMsg(id, 'some msg')
    render('Saved Msg', savedMsg)
}

function render(title, mix = '') {
    console.log(title, mix)
    const output = utilService.prettyJSON(mix)
    document.querySelector('h2').innerText = title
    document.querySelector('pre').innerHTML = output
}

