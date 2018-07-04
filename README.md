# batch-sql-inserts
Script to batch SQL inserts into SQL table inserts using streams

```
INSERT INTO my_table VALUES(1, 2, 3)
INSERT INTO my_table VALUES(1, 2, 3)
INSERT INTO my_table VALUES(1, 2, 3)
INSERT INTO my_table VALUES(1, 2, 3)
```
The above is convert to:
```
INSERT INTO my_table
    VALUES(1, 2, 3),
    VALUES(1, 2, 3),
    VALUES(1, 2, 3),
    VALUES(1, 2, 3);
```

## Usage
`node batch-inserts.js [table name] [batch size]`

## Notes
- Input filename: `inserts.sql`
- Output filename: `table-inserts.sql`