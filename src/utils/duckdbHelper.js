// import * as duckdb from "@duckdb/duckdb-wasm";
// fetchData;
// // const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
// // // Select a bundle based on browser checks
// // const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

// export async function fetchData(limit = 100, offset = 1) {
//   // Instantiate the asynchronous version of DuckDB-wasm
//   const worker = new Worker("duckdb-browser-eh.worker.js");
//   const logger = new duckdb.ConsoleLogger();
//   const db = new duckdb.AsyncDuckDB(logger, worker);
//   await db.instantiate("duckdb-eh.wasm", "duckdb-browser-eh.worker.js");

//   // Load the JSON file from S3
//   const s3Data = await duckdb.loadJSONFromS3("s3://marx23092023/logs.json");

//   // Create a table with the JSON data
//   const table = db.createTable("my_table", s3Data);

//   // Execute a query to read only the top 100 records from the table
//   const result = await db.execute(`SELECT * FROM my_table LIMIT ${limit}`);

//   // Display the results on the front-end
//   console.log(result);
// }

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

let _db;

export async function initCon() {
  if (_db) {
    return _db;
  }
  const MANUAL_BUNDLES = {
    mvp: {
      mainModule: duckdb_wasm,
      mainWorker: mvp_worker,
    },
    eh: {
      mainModule: duckdb_wasm_eh,
      mainWorker: eh_worker,
    },
  };
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  _db = new duckdb.AsyncDuckDB(logger, worker);
  await _db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  // Create a new connection
  return _db;
}

