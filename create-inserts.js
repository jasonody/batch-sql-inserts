const fs = require('fs')
const { Readable } = require('stream')
const numberOfInserts = process.argv[2] || 10000

const insertsGenerator = new Readable({
    read(size) {
        for (let i = 1; i <= numberOfInserts; i++) {
            this.push(`INSERT INTO my_table VALUES (${i}, GETDATE(), GETDATE())\n`)
        }
        this.push(null)
    }
})

insertsGenerator
    .pipe(fs.createWriteStream('inserts.sql'))
    .on('finish', () => process.stdout.write('Done creating inserts.sql\n'))