
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY = 'toy'

export const toyService = {
    query,
    getById,
    save,
    remove,
    getEmptyToy,
    addToyMsg
}
window.cs = toyService


async function query(filterBy = { txt: '', price: 0 }) {
    var toys = await storageService.query(STORAGE_KEY)
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        toys = toys.filter(toy => regex.test(toy.name) || regex.test(toy.description))
    }
    if (filterBy.price) {
        toys = toys.filter(toy => toy.price <= filterBy.price)
    }
    return toys
}

function getById(toyId) {
    return storageService.get(STORAGE_KEY, toyId)
}

async function remove(toyId) {
    await storageService.remove(STORAGE_KEY, toyId)
}

async function save(toy) {
    var savedToy
    if (toy._id) {
        savedToy = await storageService.put(STORAGE_KEY, toy)
    } else {
        // Later, owner is set by the backend
        savedToy = await storageService.post(STORAGE_KEY, toy)
    }
    return savedToy
}

async function addToyMsg(toyId, txt) {
    // Later, this is all done by the backend
    const toy = await getById(toyId)
    if (!toy.msgs) toy.msgs = []

    const msg = {
        id: utilService.makeId(),
        by: userService.getLoggedinUser(),
        txt
    }
    toy.msgs.push(msg)
    await storageService.put(STORAGE_KEY, toy)

    return msg
}

function getEmptyToy() {
    return {
        name: 'Susita-' + (Date.now() % 1000),
        price: utilService.getRandomIntInclusive(1000, 9000),
    }
}


// TEST DATA
// storageService.post(STORAGE_KEY, {name: 'Subali Rahok 2', price: 980}).then(x => console.log(x))




