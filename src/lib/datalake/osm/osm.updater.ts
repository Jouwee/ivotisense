import { Geometry } from '$lib/commons/geometry'
import { Log } from '../../commons/log'
import type { OsmDao } from './osm.dao'
import type { Class, NativeOsmElement, NativeOsmExtract, NaturalFeature, Place } from './osm.types'

export class OsmUpdater {
    
    constructor(
        private osm: OsmDao
    ) {}

    async update() {
        this.osm.deleteMany()
        Log.info('Downloading OSM Extract')
        const extract: NativeOsmExtract = await this.downloadOsmExtract()
        Log.info('Parsing extract')
        const places = this.parseExtract(extract)
        Log.info('Computing geometry')
        this.computeGeometry(places)
        Log.info('Creating missing intermediaries')
        this.createMissingIntermediaries(places)
        Log.info('Inserting data')
        this.osm.insertMany(places)
        Log.info('Done')
    }

    async downloadOsmExtract() {

        // Ivoti
        const geobox = {
            start: { lat: -29.63, lon: -51.1866 },
            end: { lat: -29.5676, lon: -51.1064 }
        }
        // Ivoti - parcial
        // const geobox = {
        //     start: { lat: -29.60, lon: -51.1666 },
        //     end: { lat: -29.5876, lon: -51.1264 }
        // }

        const url = `https://www.openstreetmap.org/api/0.6/map.json?bbox=${geobox.start.lon}%2C${geobox.start.lat}%2C${geobox.end.lon}%2C${geobox.end.lat}`
        const result = await fetch(url)
        return await result.json()
    }

    parseExtract(extract: NativeOsmExtract): Place[] {
        const nodesHash = this.createNodeHash(extract.elements)
        const places = []
        for (let i = 0; i < extract.elements.length; i++) {
            const element = extract.elements[i]
            const place: Place = {
                id: element.id,
                type: element.type,
                class: 'unknown',
                subclass: 'unknown',
                originalOsmelement: element
            }
            if (element.type === 'way') {
                if ('nodes' in element) {
                    place.polygon = element.nodes.map(node => nodesHash[node]).map(node => [node.lon, node.lat])
                }
                if (element.tags && element.tags['highway']) {
                    place.class = 'road'
                } else if (element.tags && element.tags['natural']) {
                    this.parseAsNaturalFeature(element, place as NaturalFeature)
                } else if (element.tags && element.tags['landuse'] === 'farmland') {
                    place.class = 'natural-feature'
                    place.subclass = 'grassland'
                } else if (element.tags && element.tags['building']) {
                    this.parseAsBuilding(element, place)
                } else if (element.tags && element.tags['place'] === 'plot') {
                    this.parseAsParcel(element, place)
                } else {
                    this.parseAsOther(element, place)
                }
            }
            places.push(place)
        }
        return places
    }
    createNodeHash(elements: NativeOsmElement[]): { [id: number]: NativeOsmElement } {
        const nodeHash: { [id: number]: NativeOsmElement } = {}
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].type === 'node') {
                nodeHash[elements[i].id] = elements[i]
            }
        }
        return nodeHash
    }

    parseAsNaturalFeature(element: NativeOsmElement, place: NaturalFeature) {
        place.class = 'natural-feature'
        if (element.tags.natural === 'water') {
            place.subclass = 'water'
        } else if (element.tags.natural === 'wood') {
            place.subclass = 'woods'
        } else if (element.tags.natural === 'grassland') {
            place.subclass = 'grassland'
        }
    }

    parseAsBuilding(element: NativeOsmElement, building: Place) {
        building.class = 'building'
        building.levels = 1
        if (element.tags.building === 'house' || element.tags.building === 'apartments' || element.tags.building === 'residential') {
            building.subclass = 'residential'
            building.households = 1
            if (element.tags['building:levels']) {
                building.levels = parseInt(element.tags['building:levels'] as string)
            }
            if (element.tags['building:flats']) {
                building.households = parseInt(element.tags['building:flats'] as string)
            }
        } else if (element.tags.building === 'industrial') {
            building.subclass = 'industrial'
        } else if (element.tags.shop) {
            building.subclass = 'commercial'
        } else if (element.tags.amenity) {
            building.subclass = 'commercial'
        } else if (element.tags.leisure) {
            building.subclass = 'park'
        }
    }

    parseAsParcel(element: NativeOsmElement, building: Place) {
        this.parseAsBuilding(element, building)
        building.class = 'parcel'
        if (element.tags.landuse === 'residential') {
            building.subclass = 'residential'
            building.households = 1
        } else if (element.tags.landuse === 'industrial') {
            building.subclass = 'industrial'
        } else if (element.tags.landuse === 'commercial') {
            building.subclass = 'commercial'
        }
    }

    parseAsOther(element: NativeOsmElement, building: Place) {
        if (element.tags && element.tags.leisure) {
            building.class = 'parcel'
            building.subclass = 'park'
        }
    }

    computeGeometry(places: Place[]): void {
        for (let i = 0; i < places.length; i++) {
            const place = places[i]
            if (place.polygon) {
                place.centroid = Geometry.centroid(place.polygon)
            }
        }
    }

    createMissingIntermediaries(places: Place[]): void {
        this._createMissingIntermediaries(places, 'building', 'parcel')
    }

    private _createMissingIntermediaries(places: Place[], detailedClass: string, intermediaryClass: Class): void {
        const buildings = places.filter(place => place.class === detailedClass)
        const parcels = places.filter(place => place.class === intermediaryClass && place.polygon)
        buildings.filter(building => {
            const centroid = building.centroid
            if (!centroid) {
                return
            }
            const parcel = parcels.find(parcel => parcel.polygon && Geometry.polyContainsPoint(parcel.polygon, centroid))
            if (parcel) {
                // console.log(parcel.subclass, building.subclass)
                if (parcel.subclass === 'unknown') {
                    parcel.subclass = building.subclass
                }
                return
            }
            const newParcel: Place = Object.assign({}, building)
            newParcel.class = intermediaryClass
            places.push(newParcel)
        })   
    }

}