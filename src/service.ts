import { Context, Logger, Service } from 'koishi'
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client'
import type { Config } from './index'

const logger = new Logger('influxdb service')

export class InfluxDBService extends Service {

    private tags = {};
    public _writeApi: WriteApi

    public constructor(
        ctx: Context,
        private influxdb: InfluxDB,
        private config: Config,
    ) {
        super(ctx, 'influxdb')
        this._writeApi = this.influxdb.getWriteApi(this.config.org, this.config.bucket)
    }

    protected start() {
        if(this.config.autoFlush) {
            setInterval(() => {
                logger.debug('flushing data')
                this.flush()
            }, this.config.interval)
        }
    }

    public flush() {
        return this._writeApi.flush()
    }

    public setTag(name: string, value: string) {
        this.tags[name] = value
        this._writeApi.useDefaultTags(this.tags)
    }

    public delTag(name: string) {
        delete this.tags[name]
        this._writeApi.useDefaultTags(this.tags)
    }

    public setTags(tags: Record<string, string>) {
        this.tags = tags
        this._writeApi.useDefaultTags(this.tags)
    }

    public writePoint(point: Point) {
        this._writeApi.writePoint(point)
    }

    public point(mesurementName: string) {
        return new PointBuilder(mesurementName, this)
    }
}

export class PointBuilder {
    private point: Point
    public constructor(
        mesurementName: string,
        private service: InfluxDBService,
    ) {
        this.point = new Point(mesurementName)
    }

    measurement(name: string) {
        this.point.measurement(name)
        return this
    }
    tag(name: string, value: string) {
        this.point.tag(name, value)
        return this
    }
    booleanField(name: string, value: boolean | any) {
        this.point.booleanField(name, value);
        return this
    }
    intField(name: string, value: number | any) {
        this.point.intField(name, value)
        return this
    }
    uintField(name: string, value: number | any) {
        this.point.uintField(name, value);
        return this;
    }
    floatField(name: string, value: number | any) {
        this.point.floatField(name, value);
        return this
    }
    stringField(name: string, value: string | any) {
        this.point.stringField(name, value);
        return this
    }
    timestamp(value: Date | number | string | undefined) {
        this.point.timestamp(value);
        return this
    }

    public write() {
        this.service.writePoint(this.point)
    }
}