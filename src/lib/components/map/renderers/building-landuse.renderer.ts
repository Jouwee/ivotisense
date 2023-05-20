import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class buildingLanduseRenderer extends GenericRenderer<Place> {

    render(
        parcel: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
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
            ctx.moveTo(...this.project(parcel.polygon[0], mapContext))
            for (let i = 1; i < parcel.polygon.length; i++) {
                ctx.lineTo(...this.project(parcel.polygon[i], mapContext));
            }
            ctx.fill()
        }
    }

}