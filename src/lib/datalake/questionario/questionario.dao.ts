import { AbstractDao } from '../abstract.dao'
import { auth as GoogleAuth, sheets as GoogleSheets } from '@googleapis/sheets'
import type { Geo } from '$lib/commons/geometry'

export class QuestionarioDao extends AbstractDao<QuestionarioResponse> {

    constructor() {
        super('questionario')
    }

    public async list(): Promise<QuestionarioResponse[]> {
        if (this.count() === 0) {
            await this.loadCache()
        }
        return super.list()
    }

    public async loadCache() {
        this.deleteMany()
        console.log('Authing')
        const auth = new GoogleAuth.GoogleAuth({
            keyFile: './sheets-credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })
        console.log('loading questionario...')
        const sheets = GoogleSheets({ version: 'v4', auth });
        return new Promise<void>(resolve => {
            sheets.spreadsheets.values.get(
                {
                    spreadsheetId: '15Ql8TpyCDfSejToiH89yjrJ9QWljWW7IuVNRatOFkkA',
                    range: 'Scores!A:N',
                },
                (err, res) => {
                    if (err || !res) return console.log('The API returned an error: ', err);
                    const rows = res.data.values;
                    if (rows && rows.length) {
                        for (const row of rows) {
                            if (row[0] === 'Longitude') {
                                continue
                            }
                            if (row[3] === '') {
                                break
                            }
                            this.insert({
                                timestamp: row[2],
                                geo: [parseFloat(row[1]), parseFloat(row[0])],
                                qualidadeDeVida: parseInt(row[3]),
                                policiamento: parseInt(row[4]),
                                bombeiros: parseInt(row[5]),
                                parques: parseInt(row[6]),
                                eventos: parseInt(row[7]),
                                agua: parseInt(row[8]),
                                esgotoSaneamento: parseInt(row[9]),
                                coletaDeLixo: parseInt(row[10]),
                                iluminacaoPublica: parseInt(row[11]),
                                saude: parseInt(row[12]),
                                biblioteca: parseInt(row[13]),
                            })
                        }
                    } else {
                        console.log('No data found.');
                    }
                    resolve()
                }
            );
        })
    }

}

export type QuestionarioResponse = {
    timestamp: Date,
    geo: Geo,
    qualidadeDeVida: number
    policiamento: number
    bombeiros: number
    parques: number
    eventos: number
    agua: number
    esgotoSaneamento: number
    coletaDeLixo: number
    iluminacaoPublica: number
    saude: number
    biblioteca: number
}