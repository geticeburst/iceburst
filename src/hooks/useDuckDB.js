import * as duckdb from '@duckdb/duckdb-wasm';
import { useEffect, useState } from 'react';

export const useDuckDB = () => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const instantiateDuckDB = async () => {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      if (bundle.mainWorker) {
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
        );
        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        const newDb = new duckdb.AsyncDuckDB(logger, worker);
        await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(worker_url);
        setDb(newDb);
      }
    };

    instantiateDuckDB();
  }, []);

  return db;
};
