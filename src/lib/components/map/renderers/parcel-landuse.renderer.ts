import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class ParcelLanduseRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        if (parcel.subclass === 'residential') {
            ctx.strokeStyle = '#20cb70';
            ctx.fillStyle = '#20cb7060';
        } else if (parcel.subclass === 'commercial') {
            ctx.strokeStyle = '#199bdc';
            ctx.fillStyle = '#199bdc60';
        } else if (parcel.subclass === 'industrial') {
            ctx.strokeStyle = '#fdc538';
            ctx.fillStyle = '#fdc53860';
        } else if (parcel.subclass === 'park') {
            ctx.strokeStyle = '#ff6088';
            ctx.fillStyle = '#ff608860';
        } else {
            ctx.fillStyle = 'gray';
        }
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