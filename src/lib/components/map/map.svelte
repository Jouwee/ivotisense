<script lang="ts">
	import { Geometry, type Geo } from '$lib/commons/geometry'
	import type { Class, Place } from '$lib/datalake/osm/osm.types'
	import { onMount } from 'svelte'
	import { BuildingBasicRenderer } from './renderers/building-basic.renderer'
	import type { GenericRenderer } from './renderers/generic.renderer'
	import { NaturalFeatureBasicRenderer } from './renderers/natural-feature-basic.renderer'
	import { ParcelBasicRenderer } from './renderers/parcel-basic.renderer'
	import { RoadBasicRenderer } from './renderers/road-basic.renderer'
	import { MapProjection } from './map-projection';
	import { HeatmapRenderer } from './renderers/heatmap.renderer';
	import HeatmapLegend from './heatmap-legend.svelte';


    export let places: Place[]

    const projection = new MapProjection()

    type Coordinate = {x: number, y: number}

    export let renderers: { [k: string]: GenericRenderer<Place> | undefined } = {}

    const defaultRenderers: { [k: string]: GenericRenderer<Place> | undefined } = {
        'road': new RoadBasicRenderer(),
        'natural-feature': new NaturalFeatureBasicRenderer(),
        'parcel': new ParcelBasicRenderer(),
        'building': new BuildingBasicRenderer()
    }
    let mergedRenderers: { [k: string]: GenericRenderer<Place> | undefined } = {}
    let heatmapRenderers: Array<HeatmapRenderer> = []

    onMount(() => {
        var canvas: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement
        render(canvas)
        $: {
            mergedRenderers = Object.assign({}, defaultRenderers, renderers)
            heatmapRenderers = Object.values(mergedRenderers).filter(r => r && r instanceof HeatmapRenderer).map(r => r as HeatmapRenderer)
            render(canvas)
        }

        let lastPress: Coordinate | undefined = undefined

        function getCanvasCoordinates(event: MouseEvent): Coordinate {
            var x = event.clientX - canvas.getBoundingClientRect().left,
                y = event.clientY - canvas.getBoundingClientRect().top;

            return {x: x, y: y};
        }

        canvas.addEventListener('mousedown', (event) => { lastPress = getCanvasCoordinates(event) }, false)
        canvas.addEventListener('mouseup', (event) => {
            const thisPress = getCanvasCoordinates(event)
            if (lastPress && distance(thisPress, lastPress) < 5) {
                const placeClicked = getElementAt(lastPress)
                if (placeClicked) {
                    console.log(placeClicked)
                }
            }
            lastPress = undefined
        }, false)
        canvas.addEventListener('mousemove', (event) => {
            if (lastPress !== undefined) {
                const currentPos = getCanvasCoordinates(event)
                projection.translatePixels(currentPos.x - lastPress.x, currentPos.y - lastPress.y)
                render(canvas)
                lastPress = currentPos
            }
        }, false)
        canvas.addEventListener('wheel', (event) => {
            if (event.deltaY < 0) {
                projection.increaseZoom()
            } else {
                projection.decreaseZoom()
            }
            render(canvas)
        }, false)
        canvas.addEventListener('resize', (event) => {
            projection.canvasCenter = [
                canvas.clientWidth / 2,
                canvas.clientHeight / 2
            ]
            render(canvas)
        }, false)
    })

    function distance(p1: Coordinate, p2: Coordinate): number {
        return Math.sqrt((p1.x - p2.x) * (p1.y - p2.y))
    }

    function getElementAt(point: Coordinate): Place | undefined {
        const geo = projection.unproject([point.x, point.y])
        for (let place of places) {
            if (place.polygon && Geometry.polyContainsPoint(place.polygon, geo)) {
                return place
            }
        }
        return undefined
    }

    function render(canvas: HTMLCanvasElement) {
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D

        if (!places) {
            return
        }
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 1850, 900)

        let sortingOrder: Class[] = ['natural-feature', 'road', 'parcel', 'building', 'unknown']
        places = places.sort((a, b) => sortingOrder.indexOf(a.class) - sortingOrder.indexOf(b.class))
        Object.entries(mergedRenderers).forEach(([k, renderer]) => {
            renderer?.init(ctx, places.filter(p => p.class === k))
        })
        for (let i = 0; i < places.length; i++) {
            let renderer = mergedRenderers[places[i].class]
            if (renderer) {
                renderer.render(places[i], ctx, projection)
            }
        }
    }

</script>

<canvas id="myCanvas" width="1850" height="830"></canvas>

<div class="legend">
    <div class="legend-card">
        {#each heatmapRenderers as renderer}
            <HeatmapLegend model={renderer.heatmapModel}></HeatmapLegend>
        {/each}
    </div>
</div>
    

<style>
    .legend {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 200px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: stretch;
        pointer-events: none;
        padding: 1rem;
    }

    .legend-card {
        background: var(--surface-2);
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: 0px 0px 16px 0px rgba(0,0,0,0.3);
    }

</style>