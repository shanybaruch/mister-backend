
// import { storageService } from './async-storage.service.js'
import { httpService } from './http.service.js'
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
    return httpService.get(STORAGE_KEY, filterBy)

    // var toys = await storageService.query(STORAGE_KEY)
    // if (filterBy.txt) {
    //     const regex = new RegExp(filterBy.txt, 'i')
    //     toys = toys.filter(toy => regex.test(toy.name) || regex.test(toy.description))
    // }
    // if (filterBy.price) {
    //     toys = toys.filter(toy => toy.price <= filterBy.price)
    // }
    // return toys

}
function getById(toyId) {
    // return storageService.get(STORAGE_KEY, toyId)
    return httpService.get(`toy/${toyId}`)
}

async function remove(toyId) {
    // await storageService.remove(STORAGE_KEY, toyId)
    return httpService.delete(`toy/${toyId}`)
}
async function save(toy) {
    var savedToy
    if (toy._id) {
        // savedToy = await storageService.put(STORAGE_KEY, toy)
        savedToy = await httpService.put(`toy/${toy._id}`, toy)

    } else {
        // Later, owner is set by the backend
        // toy.owner = userService.getLoggedinUser()
        // savedToy = await storageService.post(STORAGE_KEY, toy)
        savedToy = await httpService.post('toy', toy)
    }
    return savedToy
}

async function addToyMsg(toyId, txt) {
    // const toy = await getById(toyId)
    // if (!toy.msgs) toy.msgs = []

    // const msg = {
    //     id: utilService.makeId(),
    //     by: userService.getLoggedinUser(),
    //     txt
    // }
    // toy.msgs.push(msg)
    // await storageService.put(STORAGE_KEY, toy)    
    const savedMsg = await httpService.post(`toy/${toyId}/msg`, {txt})
    return savedMsg
}


function getEmptyToy() {
    return {
        name: 'Susita-' + (Date.now() % 1000),
        price: utilService.getRandomIntInclusive(1000, 9000),
    }
}





