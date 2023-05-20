import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class RoadBasicRenderer extends GenericRenderer<Place> {

    render(
        road: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#eeeeee'
        if (road.polygon) {
            ctx.beginPath();
            ctx.moveTo(...this.project(road.polygon[0], mapContext))
            for (let i = 1; i < road.polygon.length; i++) {
                ctx.lineTo(...this.project(road.polygon[i], mapContext));
            }
            ctx.stroke()
        }
    }

}