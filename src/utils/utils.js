import dayjs from 'dayjs';
import React from 'react';

export const getTimeSelectOption = () => {

  const options = [
    { label: 'All', value: 'all' },
    { label: '5min', value: '5min' },
    { label: '1D', value: '1D' },
    { label: '7D', value: '7D' },
    { label: '30D', value: '30D' },
    { label: '1Y', value: '1Y' },
    { label: '2Y', value: '2Y' },
  ];

  return options
}

const LocalStorageService = {
  // Get data from local storage
  get: (key) => {
      try {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
      } catch (error) {
          console.error('Error getting data from local storage:', error);
          return null;
      }
  },

  // Set data in local storage
  set: (key, value) => {
      try {
          localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
          console.error('Error setting data in local storage:', error);
      }
  },

  // Remove data from local storage
  remove: (key) => {
      try {
          localStorage.removeItem(key);
      } catch (error) {
          console.error('Error removing data from local storage:', error);
      }
  }
};

export default LocalStorageService;


export const generateChartData = (data,selectedNamespace="tmp") =>{
  if (data) {
    const metricDataProcess = new Map();
    data.forEach((row) => {
      const { metricName, timestamp, sum } = row;
      if (!metricDataProcess.has(metricName)) {
        metricDataProcess.set(metricName, []);
      }
      metricDataProcess
        .get(metricName)
        .push({ date: timestamp, sum: parseFloat(sum) });
    });
    let result = Object.fromEntries(metricDataProcess)
    const newChartsData = {};
    newChartsData[selectedNamespace] = result
   return result
}
}
const ARRAY_SIZE = 20;
const RESPONSE_TIME_IN_MS = 1000;

function loadItems(startCursor = 0) {
  return new Promise((resolve) => {
    let newArray = [];

    setTimeout(() => {
      for (let i = startCursor; i < startCursor + ARRAY_SIZE; i++) {
        const newItem = {
          key: i,
          value: `This is item ${i}`,
        };
        newArray = [...newArray, newItem];
      }

      resolve({ hasNextPage: true, data: newArray });
    }, RESPONSE_TIME_IN_MS);
  });
}


export function useLoadItems() {
  console.log("scroll")
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [hasNextPage, setHasNextPage] = React.useState(true);
  const [error, setError] = React.useState();

  async function loadMore() {
    setLoading(true);
    try {
      const { data, hasNextPage: newHasNextPage } = await loadItems(items.length);
      setItems((current) => [...current, ...data]);
      setHasNextPage(newHasNextPage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { loading, items, hasNextPage, error, loadMore };
}


export const getTimeRange = (timeValue) => {
  const now = dayjs(); // Get the current date and time
  let startDate, endDate;

  if (timeValue === '5min') {
    endDate = now;
    startDate = now.subtract(5, 'minute');
  } else if (timeValue === '1D') {
    endDate = now;
    startDate = now.subtract(1, 'day');
  } else if (timeValue === '7D') {
    endDate = now;
    startDate = now.subtract(7, 'day');
  } else if (timeValue === '30D') {
    endDate = now;
    startDate = now.subtract(30, 'day');
  } else if (timeValue === '1Y') {
    endDate = now;
    startDate = now.subtract(1, 'year');
  } else if (timeValue === '2Y') {
    endDate = now;
    startDate = now.subtract(2, 'year');
  } else {
    // Handle unsupported time values
    throw new Error('Unsupported time value');
  }

  // Format the start and end dates as needed
  const formattedStartDate = startDate.format('YYYY-MM-DD HH:mm:ss');
  const formattedEndDate = endDate.format('YYYY-MM-DD HH:mm:ss');

  return { startDate: formattedStartDate, endDate: formattedEndDate };
};