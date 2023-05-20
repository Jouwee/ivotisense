import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class ParcelBasicRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00000005'
        ctx.fillStyle = '#00000005'
        if (parcel.polygon) {
            ctx.beginPath();
            ctx.moveTo(...projection.project(parcel.polygon[0]))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...projection.project(parcel.polygon[i]));
            }
            ctx.stroke()
            ctx.fill()
        }
    }

}