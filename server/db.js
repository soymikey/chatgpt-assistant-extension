import * as fs from 'fs';

class DB {
    constructor(storageFile) {
        this.storageFile = storageFile
        this.data = {}
        this.loadData()
    }

    loadData() {
        try {
            const data = fs.readFileSync(this.storageFile, 'utf-8')
            this.data = JSON.parse(data)
        } catch (err) {
            if (err.code === 'ENOENT') {
                this.data = {}
                this.save()
            } else {
                throw err
            }
        }
    }

    save() {
        fs.writeFileSync(this.storageFile, JSON.stringify(this.data))
    }

    get(key) {
        return this.data[key]
    }

    set(key, value) {
        this.data[key] = value
        this.save()
    }

    remove(key) {
        delete this.data[key]
        this.save()
    }

    list() {
        return Object.keys(this.data)
    }
}

const db = new DB('storage.json')
export default db
