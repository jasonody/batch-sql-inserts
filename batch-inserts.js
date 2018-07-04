const fs = require('fs')
const { Transform } = require('stream')
const tableName = process.argv[2] || 'my_table'
const batchSize = process.argv[3] || 1000

const lineTransform = new Transform({
    transform(chunk, encoding, callback) {
        const lines = chunk.toString().split('\n')

        if (this.lineBuffer) {
            lines[0] = `${this.lineBuffer}${lines[0]}`
            this.lineBuffer = ''
        }

        if (!chunk.toString().endsWith('\n')) {
            this.lineBuffer = lines.pop()
        }

        lines.forEach(line => { 
            const valuesIndex = line.search(/VALUES/i)
            if (valuesIndex > -1) {
                line = line.slice(valuesIndex)
            }

            this.push(line) 
        })

        callback(null)
    }
})

const batchTransform = new Transform({
    transform(chunk, encoding, callback) {
        if (this.lineCount % batchSize === 0) {
            this.push(`\nINSERT INTO ${tableName}\n\t${chunk.toString()}`)
        } else {
            this.push(`,\n\t${chunk.toString()}`)
        }

        this.lineCount++

        callback(null)
    }
})
batchTransform.lineCount = 0

const progress = new Transform({
    transform(chunk, encoding, callback) {
        if (this.count % batchSize === 0) {
            process.stdout.write('.')
        }

        this.count++

        callback(null, chunk)
    }
})
progress.count = 0

fs.createReadStream('inserts.sql')
    .pipe(lineTransform)
    .pipe(batchTransform)
    .pipe(progress)
    .pipe(fs.createWriteStream('table-inserts.sql'))
    .on('finish', () => { process.stdout.write('Done!\n') })

// To debug:
// run script with: node --inspect-brk batch-inserts.js [table name] [batch size]
// get chrome dev tools link by running this command in another terminal: curl http://[host:port]/json/list
//   get host and port from terminal running the script you want to debug