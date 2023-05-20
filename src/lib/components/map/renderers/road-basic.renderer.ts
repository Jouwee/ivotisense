import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class RoadBasicRenderer extends GenericRenderer<Place> {

    render(
        road: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ) {
        ctx.lineWidth = 1 * projection.zoom;
        ctx.strokeStyle = '#eeeeee'
        if (road.polygon) {
            ctx.beginPath();
            ctx.moveTo(...projection.project(road.polygon[0]))
            for (let i = 1; i < road.polygon.length; i++) {
                ctx.lineTo(...projection.project(road.polygon[i]));
            }
            ctx.stroke()
        }
    }

}