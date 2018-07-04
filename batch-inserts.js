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
        this.lines.push(chunk.toString())

        if (this.lines.length == batchSize) {
            const output = `INSERT INTO ${tableName}\n\t${this.lines.join(',\n\t')}`
            this.push(output + ';\n')

            this.lines = []
        }

        callback(null)
    }
})
batchTransform.lines = []

const progress = new Transform({
    transform(chunk, encoding, callback) {
        process.stdout.write('.')

        callback(null, chunk)
    }
})

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