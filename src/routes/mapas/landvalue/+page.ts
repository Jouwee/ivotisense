import { LandValueDao } from '$lib/datalake/landvalue/landvalue'
import { OsmDao } from '$lib/datalake/osm/osm.dao'
import type { PageLoad } from './$types'

export const load = (({ params }) => {
    return {
        places: new OsmDao().list(),
        landValues: new LandValueDao().list()
    }
}) satisfies PageLoad