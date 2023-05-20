const globalRecords: { [key: string]: unknown[] } = {}

export class AbstractDao<T> {

    constructor(
        private key: string
    ) {
        globalRecords[key] = []
    }

    public insert(record: T) {
        globalRecords[this.key].push(record)
    }

    public insertMany(records: T[]) {
        for (let i = 0; i < records.length; i++) {
            globalRecords[this.key].push(records[i])
        }
    }

    public deleteMany() {
        globalRecords[this.key].splice(0, globalRecords[this.key].length)
    }

    public async list(): Promise<T[]> {
        return globalRecords[this.key] as T[]
    }

    public count(): number {
        return globalRecords[this.key].length
    }

}