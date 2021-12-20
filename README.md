# koishi-plugin-influxdb

记录您的数据到 influxdb

## 使用方法

配置 bot 时在您的 koishi.config.yml 中编辑并添加本插件

### 参数

- url

- token

- org

- bucket

- autoFlush: 默认开启。自动上传数据。

- interval: 默认为 60 * 1000。自动上传的间隔。

另请参阅: [InfluxDB](https://github.com/influxdata/influxdb-client-js/blob/master/packages/core/src/options.ts)

### 查询

指令: `influxdb.query <query>`

- 权限: 3
- 示例:

```flux
influxdb.query from(bucket: "koishi") |> range(start: -1h) |> filter(fn: (r) => r["_field"] == "www") |> limit(n: 10)
```

### API

在配置好本插件过后可以在您的插件内使用本插件的 api 往 influxdb 中存数据

示例:

```typescript
import { Context } from 'koishi'
import 'koishi-plugin-influxdb'

export function apply(ctx: Context) {
    ctx.using(['influxdb'], () => {
        ctx.influxdb.point('koishi')
            .tag('foo', 'bar')
            .tag('a', 'b')
            .intField('test', 514)
            .write()
    })
}
```

接口:

```typescript
class InfluxDBService extends Service {

    flush(): Promise<void>

    setTag(name: string, value: string): void

    delTag(name: string): void

    setTags(tags: Record<string, string>): void

    writePoint(point: Point): void

    point(mesurementName: string): PointBuilder

}

class PointBuilder {

    measurement(name: string): this

    tag(name: string, value: string): this

    booleanField(name: string, value: boolean | any): this

    intField(name: string, value: number | any): this

    uintField(name: string, value: number | any): this

    floatField(name: string, value: number | any): this

    stringField(name: string, value: string | any): this

    timestamp(value: Date | number | string | undefined): this

    write(): void
}
```