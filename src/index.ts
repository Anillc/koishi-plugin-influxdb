import { InfluxDB as IDB, ClientOptions, WriteApi, InfluxDB } from '@influxdata/influxdb-client'
import { Context, Logger, s } from 'koishi'
import { InfluxDBService } from './service'

declare module 'koishi' {
    namespace Context {
        interface Services {
            influxdb: InfluxDBService
        }
    }
}

export type Config = {
    org: string
    bucket: string
    autoFlush: boolean
    interval: number
} & ClientOptions

const logger = new Logger('influxdb')

export const name = 'influxdb'

export function apply(ctx: Context, config: Config) {
    config = {
        autoFlush: true,
        interval: 60 * 1000,
        ...config
    }
    const influxdb = new InfluxDB(config)
    const queryApi = influxdb.getQueryApi(config.org)

    Context.service('influxdb')
    ctx.influxdb = new InfluxDBService(ctx, influxdb, config)

    const cmd = ctx.command('influxdb', { authority: 3 })
    cmd.subcommand('.query <query:rawtext>')
        .action(async (_, query) => {
            return new Promise((res) => {
                const result = [];
                queryApi.queryRows(query, {
                    next(row, tableMeta) {
                        const obj = tableMeta.toObject(row)
                        result.push(`${result.length + 1}: ${obj._value}`)
                    },
                    error(error) {
                        res(`请求错误 ${error}`)
                    },
                    complete() {
                        if(result.length == 0) {
                            res('查询结果为空。')
                            return
                        }
                        if(result.length > 50) {
                            res('请求结果过多，请尝试增加查询条件。')
                            return
                        }
                        res(s.escape(result.join('\n')))
                    },
                })
            })
        })
}
