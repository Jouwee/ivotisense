import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class ParcelBasicRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#00000005'
        ctx.fillStyle = '#00000005'
        if (parcel.polygon) {
            ctx.beginPath();
            ctx.moveTo(...this.project(parcel.polygon[0], mapContext))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...this.project(parcel.polygon[i], mapContext));
            }
            ctx.stroke()
            ctx.fill()
        }
    }

}