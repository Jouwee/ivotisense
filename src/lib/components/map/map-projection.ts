import type { Geo } from "$lib/commons/geometry"

const zooms = [
    1000 * 8,
    1000 * 12,
    1000 * 16,
    1000 * 24,
    1000 * 32,
    1000 * 56,
    1000 * 64,
    1000 * 96,
    1000 * 128
]

export class MapProjection {

    public zoom: number
    public center: Geo
    public canvasCenter: [number, number] = [800, 500]
    
    constructor() {
        this.zoom = 4
        this.center = [-51.16324999697754, -29.607505840326247]
    }    

    public project(geo: Geo): [number, number] {
        return [
            this.canvasCenter[0] + ((geo[0] - this.center[0])) * zooms[this.zoom],
            this.canvasCenter[1] - (((geo[1] - this.center[1]))  * zooms[this.zoom]),
        ]
    }

    public unproject(pixelPoint: [number, number]): Geo {
        return [
            ((this.canvasCenter[0] + pixelPoint[0]) / zooms[this.zoom]) + this.center[0],
            ((this.canvasCenter[1] - pixelPoint[1]) / zooms[this.zoom]) + this.center[1],
        ]
    }

    public translatePixels(diffX: number, diffY: number) {
        this.center[0] = this.center[0] - (diffX / zooms[this.zoom])
        this.center[1] = this.center[1] + (diffY / zooms[this.zoom])
    }

    public increaseZoom() {
        this.zoom = Math.min(Math.max(this.zoom+1, 0), zooms.length - 1)
    }

    public decreaseZoom() {
        this.zoom = Math.min(Math.max(this.zoom-1, 0), zooms.length - 1)
    }

}