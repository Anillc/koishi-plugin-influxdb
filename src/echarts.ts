export function getHTML(data: string) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/echarts@5.2.2/dist/echarts.min.js"></script>
    <script src="https://unpkg.com/csv-parse@5.0.3/dist/umd/sync.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/zh/asset/theme/vintage.js"></script>
</head>
<body>
    <div id="chart" style="width: 1000px; height: 500px;"></div>
    <script>
        const rawData = \`${data}\`
        const data = csv_parse_sync.parse(rawData, {
            skip_empty_lines: true,
            columns: true,
            comment: '#',
            cast: true
        })
        const map = new Map()
        const series = []
        for(const i of data) {
            let table = map.get(i.table)
            if (!table) {
                series.push({
                    type: 'line',
                    datasetIndex: map.size,
                    smooth: true,
                    color: ['#' + (Math.random() * 0xffffff << 0).toString(16)],
                    itemStyle: {
                        opacity: 0
                    }
                })
                table = {
                    dimensions: ['_time', '_value'],
                    source: []
                }
                map.set(i.table, table)
            }
            table.source.push(i)
        }
        const chart = echarts.init(document.getElementById('chart'), 'vintage')
        chart.setOption({
            dataset: [...map.values()],
            xAxis: { type: 'time' },
            yAxis: { type: 'value' },
            animation: false,
            series
        })
    </script>
</body>
</html>`

}