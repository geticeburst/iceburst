export const fetchDataFromS3 = async (db) => {
    const response = await fetch('https://duckstream.s3.amazonaws.com/metrics.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
    const jsonContent = await response.text();
    await db.registerFileText('metrics.json', jsonContent);
  };
  