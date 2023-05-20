<script lang="ts">
    import type { PageData } from './$types'
    import MapComponent from '$lib/components/map/map.svelte'
	import { PlaceHeatmapRenderer } from '$lib/components/map/renderers/place-heatmap.renderer';

    export let data: PageData;

    const customRenderers = {
        'parcel': new PlaceHeatmapRenderer('totalLandValue'),
        'building': undefined,
    }

</script>

<MapComponent 
    places={data.places}
    renderers={customRenderers}>

</MapComponent>