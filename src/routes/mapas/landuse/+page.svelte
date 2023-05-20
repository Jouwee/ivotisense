<script lang="ts">
    import type { PageData } from './$types'
    import MapComponent from '$lib/components/map/map.svelte'
	import { ParcelLanduseRenderer } from '$lib/components/map/renderers/parcel-landuse.renderer';
	import { buildingLanduseRenderer } from '$lib/components/map/renderers/building-landuse.renderer';

    export let data: PageData;

    const customRenderers = {
        'parcel': new ParcelLanduseRenderer(),
        'building': new buildingLanduseRenderer(),
    }

</script>

<MapComponent 
    places={data.places}
    renderers={customRenderers}>

</MapComponent>