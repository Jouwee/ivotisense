import type { Place } from '$lib/datalake/osm/osm.types'
import type { HeatmapModel } from '../heatmap-model'
import type { MapProjection } from '../map-projection'
import { GenericRenderer } from './generic.renderer'

export class HeatmapRenderer extends GenericRenderer<Place> {

    constructor(
        public heatmapModel: HeatmapModel
    ) {
        super()
    }

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ) {
        if (parcel.centroid) {
            const pct = this.heatmapModel.getValueAt(parcel.centroid).percentageValue
            ctx.fillStyle = this.lerpColor(this.heatmapModel.gradient[0], this.heatmapModel.gradient[1], pct)
        } else {
            ctx.fillStyle = '#FF0000'
        }


        if (parcel.polygon) {
            ctx.beginPath();
            ctx.moveTo(...projection.project(parcel.polygon[0]))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...projection.project(parcel.polygon[i]));
            }
            ctx.fill()
        }
    }

}