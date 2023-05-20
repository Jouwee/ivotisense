import type { Geo } from '$lib/commons/geometry'
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class PlaceHeatmapRenderer extends GenericRenderer<Place> {

    private minValue = 0
    private maxValue = 0

    constructor(
        private attribute: string
    ) {
        super()
    }

    public init(
        _ctx: CanvasRenderingContext2D,
        _mapContext: { offset: Geo, zoom: number },
        places: Place[]
    ): void {
        this.minValue = Infinity
        this.maxValue = -Infinity
        for (let i = 0; i < places.length; i++) {
            if (this.attribute in places[i]) {
                const value = (places[i] as any)[this.attribute]
                if (value < this.minValue) {
                    this.minValue = value
                }
                if (value > this.maxValue) {
                    this.maxValue = value
                }
            }
        }
    }

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {

        let value = 0
        if (this.attribute in parcel) {
            value = (parcel as any)[this.attribute]
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

}