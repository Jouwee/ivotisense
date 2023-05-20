import { Geometry, type Geo } from '$lib/commons/geometry'
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class HeatmapRenderer extends GenericRenderer<Place> {

    private minValue = 0
    private maxValue = 0

    constructor(
        private values: Array<{ geo: Geo, value: number}>,
        bounds: { min: number, max: number } | undefined = undefined
    ) {
        super()
        if (bounds) {
            this.minValue = bounds.min
            this.maxValue = bounds.max
        }
    }

    public init(
        _ctx: CanvasRenderingContext2D,
        _mapContext: { offset: Geo, zoom: number },
        _places: Place[]
    ): void {
        if (this.minValue != 0 && this.maxValue != 0) {
            return
        }
        this.minValue = Infinity
        this.maxValue = -Infinity
        for (let i = 0; i < this.values.length; i++) {
            const value = this.values[i].value
            if (value < this.minValue) {
                this.minValue = value
            }
            if (value > this.maxValue) {
                this.maxValue = value
            }
        }
    }

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        if (parcel.centroid) {
            const closest = this.getClosest(parcel.centroid)
            const value = closest.value
            // TODO: Lerping
            //console.log(value, this.minValue, this.maxValue )
            const pct = (value - this.minValue) / (this.maxValue - this.minValue)
            ctx.fillStyle = this.lerpColor('#e24c33', '#39a8f0', pct)
        } else {
            ctx.fillStyle = '#FF0000'
        }


        if (parcel.polygon) {
            ctx.beginPath();
            ctx.moveTo(...this.project(parcel.polygon[0], mapContext))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...this.project(parcel.polygon[i], mapContext));
            }
            ctx.fill()
        }
    }

    getClosest(geo: Geo): { distance: number, value: number } {
        let distance = Infinity
        let value = 0
        for (let i = 0; i < this.values.length; i++) {
            const d = Geometry.distance(geo, this.values[i].geo)
            // console.log(d)
            if (d < distance) {
                distance = d
                value = this.values[i].value
            }
        }
        return { distance, value }
    }

}