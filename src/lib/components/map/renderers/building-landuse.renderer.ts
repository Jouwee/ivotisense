import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class buildingLanduseRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ) {
        ctx.lineWidth = 1;
        if (parcel.subclass === 'residential') {
            ctx.fillStyle = '#20cb70';
        } else if (parcel.subclass === 'commercial') {
            ctx.fillStyle = '#199bdc';
        } else if (parcel.subclass === 'industrial') {
            ctx.fillStyle = '#fdc538';
        } else {
            ctx.fillStyle = 'gray';
        }
        if (parcel.polygon) {
            ctx.beginPath();
            ctx.moveTo(...projection.project(parcel.polygon[0]))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...projection.project(parcel.polygon[i]))
            }
            ctx.fill()
        }
    }

}