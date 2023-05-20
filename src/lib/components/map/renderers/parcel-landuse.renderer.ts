import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class ParcelLanduseRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
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
            ctx.moveTo(...projection.project(parcel.polygon[0]))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...projection.project(parcel.polygon[i]))
            }
            ctx.stroke()
            ctx.fill()
        }
    }

}