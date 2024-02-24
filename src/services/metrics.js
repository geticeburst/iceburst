import { useDuckDB } from "../hooks/useDuckDB";
import { initCon } from "../utils/duckdbHelper";

const s3_url = "https://duckstream.s3.amazonaws.com/";
// const s3_url = "s3://marx23092023/";

export async function fetchData(lazyParams) {
  const { limit = 10, offset = 1 } = lazyParams;
  const db = await initCon();
  //   const db = useDuckDB();
  const conn = await db.connect();

  const fileName = "metrics.json"; //"fhvhv_tripdata_2023-01.parquet";
  // Either materialize the query result
  const arrowResult = await conn.query(
    `SELECT * FROM read_json_auto('s3://marx23092023/${fileName}') limit ${limit} offset ${offset}`
  );

  // Convert arrow table to json
  const result = arrowResult.toArray().map((row) => row.toJSON());

  //   // ..., or fetch the result chunks lazily
  //   for await (const batch of await conn.send(
  //     `SELECT * FROM 's3://marx23092023/${fileName}' limit ${limit} offset ${offset}`
  //   )) {
  //     const result = batch.toArray().map((row) => row.toJSON());
  //   }

  // const totalRecs = await conn.query(
  //   `SELECT count(*) FROM 's3://marx23092023/${fileName}'`
  // );
  // const totalRecsResult = totalRecs.toArray().map((row) => row.toJSON());
  // if (offset < 50) fetchData(10, offset + 10);
  conn.close();
}

export async function getAllNamespace(data) {
  const db = await initCon();
  const conn = await db.connect();

  const fileName = "metrics.json"; //"fhvhv_tripdata_2023-01.parquet";
  // Either materialize the query result
  const arrowResult = await conn.query(
    `SELECT DISTINCT namespace FROM read_json_auto('${s3_url + fileName}')`
  );

  // Convert arrow table to json
  const result = arrowResult.toArray().map((row) => row.toJSON());

  conn.close();
  return result;
}

export async function getUniqueMatricsBasedOnNamespace(qeryParam) {
  console.log("qeryParam", qeryParam);
  const { selectedNamespace: namespace, lazyParams } = qeryParam;
  const db = await initCon();
  const conn = await db.connect();

  const fileName = "metrics.json"; //"fhvhv_tripdata_2023-01.parquet";

  let dynamicQuery = `SELECT DISTINCT metricName, timestamp, value->>'sum' AS sum ,namespace
  FROM read_json_auto('${s3_url + fileName}') 
  `;

  if (lazyParams?.searchText) {
    dynamicQuery += ` WHERE (metricName ILIKE '%${lazyParams.searchText}%' OR namespace ILIKE '%${lazyParams.searchText}%')`;
  } else if (qeryParam?.metricName && qeryParam?.namespace) {
    dynamicQuery += ` WHERE metricName = '${qeryParam?.metricName}' AND namespace = '${qeryParam?.namespace}'`;
  } else {
    dynamicQuery += ` WHERE namespace = '${namespace}'`;
  }

  if (lazyParams?.dates && Object.keys(lazyParams?.dates).length !== 0) {
    dynamicQuery += ` AND timestamp BETWEEN '${lazyParams.dates.startDate}' AND '${lazyParams.dates.endDate}'`;
  }

  dynamicQuery += ` ORDER BY metricName, timestamp`;
  const arrowResult = await conn.query(dynamicQuery);

  // Convert arrow table to json
  const result = arrowResult.toArray().map((row) => row.toJSON());

  conn.close();
  return result;
}

export async function getAllMatricData(metricName) {
  const db = await initCon();
  const conn = await db.connect();

  const fileName = "metrics.json"; //"fhvhv_tripdata_2023-01.parquet";
  // Either materialize the query result

  const arrowResult = await conn.query(
    `SELECT * FROM read_json_auto('${
      s3_url + fileName
    }') where metricName = '${metricName}' `
  );

  // Convert arrow table to json
  const result = arrowResult.toArray().map((row) => row.toJSON());

  conn.close();
  return result;
}
