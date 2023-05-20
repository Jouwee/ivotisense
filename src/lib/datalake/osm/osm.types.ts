import type { Geo, GeoPolygon } from "$lib/commons/geometry"

export type Class = 'unknown' | 'road' | 'natural-feature' | 'parcel' | 'building'
export type Subclass = 'unknown' | 'residential' | 'industrial' | 'commercial' | 'park' | NaturalSubclass
export type NaturalSubclass = 'grassland' | 'woods' | 'water' | 'unknown'

export interface Place {
    id: number,
    type: 'node' | 'way' | 'relation',
    class: Class,
    subclass: Subclass,
    polygon?: GeoPolygon,
    centroid?: Geo,
    originalOsmelement?: NativeOsmElement,
    levels?: number,
    households?: number,
    totalLandValue?: number
}

export interface NaturalFeature extends Place {
    class: 'natural-feature',
    subclass: NaturalSubclass
}

export interface NativeOsmExtract {
    version: string,
    generator: string,
    copyright: string,
    attribution: string,
    license: string,
    bounds: {
        minlat: number,
        minlon: number,
        maxlat: number,
        maxlon: number
    },
    elements: NativeOsmElement[]
}

export interface NativeOsmElement {
    type: 'node' | 'way' | 'relation',
    id: number,
    lat: number,
    lon: number,
    timestamp: string,
    version: number,
    changeset: number,
    user: string,
    uid: number,
    nodes: number[],
    tags: {
        [key: string]: unknown
    }
}