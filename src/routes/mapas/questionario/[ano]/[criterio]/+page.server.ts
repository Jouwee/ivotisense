import { OsmDao } from '$lib/datalake/osm/osm.dao'
import { QuestionarioDao, type QuestionarioResponse } from '$lib/datalake/questionario/questionario.dao'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
    let field: keyof QuestionarioResponse
    switch (params.criterio) {
        case 'qualidade-de-vida': field = 'qualidadeDeVida'; break;
        case 'policiamento': field = 'policiamento'; break;
        case 'bombeiros': field = 'bombeiros'; break;
        case 'parques': field = 'parques'; break;
        case 'eventos': field = 'eventos'; break;
        case 'agua': field = 'agua'; break;
        case 'esgoto-e-saneamento': field = 'esgotoSaneamento'; break;
        case 'coleta-de-lixo': field = 'coletaDeLixo'; break;
        case 'iluminacao-publica': field = 'iluminacaoPublica'; break;
        case 'saude': field = 'saude'; break;
        case 'biblioteca': field = 'biblioteca'; break;
    }
    const allScores = await new QuestionarioDao().list()
    console.log(allScores)
    const scores = allScores.map(s => ({ geo: s.geo, value: s[field] as number })).filter(s => s)
    return {
        places: await new OsmDao().list(),
        georeferencedScores: scores.filter(s => s.geo)
    }
}) satisfies PageServerLoad