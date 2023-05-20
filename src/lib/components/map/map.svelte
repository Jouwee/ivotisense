<script lang="ts">
	import { Geometry, type Geo } from '$lib/commons/geometry'
	import type { Class, Place } from '$lib/datalake/osm/osm.types'
	import { onMount } from 'svelte'
	import { BuildingBasicRenderer } from './renderers/building-basic.renderer'
	import type { GenericRenderer } from './renderers/generic.renderer'
	import { NaturalFeatureBasicRenderer } from './renderers/natural-feature-basic.renderer'
	import { ParcelBasicRenderer } from './renderers/parcel-basic.renderer'
	import { RoadBasicRenderer } from './renderers/road-basic.renderer'


    export let places: Place[]

    let zoom = 80000
    const viewbox = {
        start: { lat: -29.625, lon: -51.1856 },
        end: { lat: -29.5676, lon: -51.1064 }
    }

    type Coordinate = {x: number, y: number}

    export let renderers: { [k: string]: GenericRenderer<Place> | undefined } = {}

    const defaultRenderers: { [k: string]: GenericRenderer<Place> | undefined } = {
        'road': new RoadBasicRenderer(),
        'natural-feature': new NaturalFeatureBasicRenderer(),
        'parcel': new ParcelBasicRenderer(),
        'building': new BuildingBasicRenderer()
    }

    onMount(() => {
        var canvas: HTMLCanvasElement = document.getElementById("myCanvas") as HTMLCanvasElement
        render(canvas)
        $: {
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
                viewbox.start.lon = viewbox.start.lon - ((currentPos.x - lastPress.x) / zoom)
                viewbox.start.lat = viewbox.start.lat + ((currentPos.y - lastPress.y) / zoom)
                render(canvas)
                lastPress = currentPos
            }
        }, false)
        canvas.addEventListener('scroll', (event) => {
            console.log('scroll', event)
            render(canvas)
        }, false)
    })

    function distance(p1: Coordinate, p2: Coordinate): number {
        return Math.sqrt((p1.x - p2.x) * (p1.y - p2.y))
    }

    function getElementAt(point: Coordinate): Place | undefined {
        const geo = toGeo(point, { offset: [viewbox.start.lon, viewbox.start.lat], zoom })
        for (let place of places) {
            if (place.polygon && Geometry.polyContainsPoint(place.polygon, geo)) {
                return place
            }
        }
        return undefined
    }

    function toGeo(coord: Coordinate, mapContext: { offset: Geo, zoom: number }): [number, number] {
        return [
            (coord.x / mapContext.zoom) + mapContext.offset[0],
            ((1000 - coord.y) / mapContext.zoom) + mapContext.offset[1],
        ]
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


        let mergedRenderers = Object.assign({}, defaultRenderers, renderers)
        Object.entries(mergedRenderers).forEach(([k, renderer]) => {
            renderer?.init(ctx, { offset: [viewbox.start.lon, viewbox.start.lat], zoom }, places.filter(p => p.class === k))
        })
        for (let i = 0; i < places.length; i++) {
            let renderer = mergedRenderers[places[i].class]
            if (renderer) {
                renderer.render(places[i], ctx, { offset: [viewbox.start.lon, viewbox.start.lat], zoom })
            }
        }
    }

</script>

<canvas id="myCanvas" width="1850" height="830"></canvas>