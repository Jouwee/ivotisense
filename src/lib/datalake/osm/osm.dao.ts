import { AbstractDao } from '../abstract.dao'
import type { Place } from './osm.types'
import { OsmUpdater } from './osm.updater'

export class OsmDao extends AbstractDao<Place> {

    constructor() {
        super('osm')
    }

    public async list(): Promise<Place[]> {
        if (this.count() === 0) {
            await new OsmUpdater(this).update()
        }
        return super.list()
    }

}