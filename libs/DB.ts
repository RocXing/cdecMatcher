"use strict";

import * as db from "any-db";

class DBPool {
    pool: db.ConnectionPool;

    constructor(pool: db.ConnectionPool) {
        this.pool = pool;
    }

    queryAsync(sql: string, data?: any[] | any): Promise<db.ResultSet> {
        let dbError = new Error();
        return new Promise<db.ResultSet>((resolve, reject) => {
            if (data === null || data === undefined) {
                data = [];
            }
            if (!Array.isArray(data)) {
                data = [data];
            }
            pool.query(sql, data, (err, result) => {
                if (err) {
                    if((<any>err).code != 23505) {
                        console.error(`###SQL:${sql};data:${data};err:${err};result:${result}`);
                    }
                    err.message += `##SQL:${sql} .`;
                    err.stack = dbError.stack;
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }
    
    close(): void {
        this.pool.close();
    }
}

let settings = require("../settings.json");
let pool = db.createPool(settings.PG, {
    min: 2,
    max: 20
});

let dbPool: DBPool = new DBPool(pool);

export = dbPool;