import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Grid,
  GridItem,
  Box,
  Text,
  Flex,
  Spacer,
  useColorModeValue

} from "@chakra-ui/react";
import {
  Page, PageHeader, PageBody, SplitPage, Toolbar, FiltersProvider,
  FiltersAddButton,
  ActiveFiltersList,
} from "@saas-ui-pro/react";
import {
  AppShell,
  SearchInput,
  Select, SelectButton, SelectList, SelectOption,
  StructuredList,
  StructuredListItem,
  StructuredListCell, LoadingOverlay, LoadingSpinner, LoadingText,
  EmptyState

} from "@saas-ui/react";
import { FiCircle, FiUser } from 'react-icons/fi'
import { useDuckDB } from "../../hooks/useDuckDB";
import { fetchDataFromS3 } from "../../utils/fetchData";
import { AreaChart, BarChart, LineChart } from "@saas-ui/charts";


import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getTimeSelectOption, getTimeRange, } from '../../utils/utils';
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { fetchData, getAllMatricData, getAllNamespace, getUniqueMatricsBasedOnNamespace } from "../../services/metrics";
import { useDebouncedCallback } from "@react-hookz/web";


dayjs.extend(utc); // Enable the UTC plugin
dayjs.extend(timezone);


const valueFormatter = (value) => {
  return value;
};

const loadDataForNamespace = async (db, namespace) => {
  const connection = await db.connect();
  try {
    // Query to fetch data for a specific namespace
    const query = `
      SELECT metricName, timestamp, value->>'sum' AS sum 
      FROM read_json_auto('metrics.json') 
      WHERE namespace = '${namespace}'
      ORDER BY metricName, timestamp
    `;
    const result = await connection.query(query);
    if (result.constructor.name === "_Table") {
      const metricData = {};
      for (let i = 0; i < result.numRows; i++) {
        const row = result.get(i);
        if (!metricData[row.metricName]) {
          metricData[row.metricName] = [];
        }
        metricData[row.metricName].push({
          date: row.timestamp,
          sum: parseFloat(row.sum),
        });
      }
      return metricData;
    } else {
      console.error("Unexpected result format:", result);
      return {};
    }
  } catch (error) {
    console.error("Error querying data for namespace", namespace, ":", error);
    return {};
  } finally {
    await connection.close();
  }
};


const determineChartType = (metricName, data) => {
  if (
    metricName.toLowerCase().includes("count") ||
    metricName.toLowerCase().includes("number") ||
    metricName.toLowerCase().includes("rate")
  ) {
    return "BarChart";
  }
  return "AreaChart";
};

const renderChart = (metricName, data) => {
  const chartType = determineChartType(metricName, data);

  const formatDate = (timestamp, use12HourFormat = false) => {
    const date = new Date(timestamp);

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    let format = '';

    if (use12HourFormat) {
      format = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    } else {
      hours = hours.toString().padStart(2, '0');
    }

    return `${hours}:${minutes} ${format}`;
  };


  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    [metricName]: item.sum,
  }));

  const ChartComponent =
    chartType === "LineChart"
      ? LineChart
      : chartType === "BarChart"
        ? BarChart
        : AreaChart;

  return (
    <ChartComponent
      data={chartData}
      xField="date"
      yField={metricName}
      categories={[metricName]}
      valueFormatter={valueFormatter}
      yAxisWidth={80}
      height="300px"
      showAnimation
      showGrid
      showLegend
      showTooltip
      showXAxis
      showYAxis
      curveType="monotone"
    />
  );
};

const NamespaceMetricsChart = ({ data, metricName }) => {
  return (
    <Card w="100%" maxW="xl">
      <CardHeader pb="0">
        <Heading as="h4" fontWeight="medium" size="md">
          {`${metricName}`}
        </Heading>
      </CardHeader>
      <CardBody>{renderChart(metricName, data)}</CardBody>
    </Card>
  );
};

const stickyStyles = {
  position: 'sticky',
  zIndex: 1,
  bg: 'chakra-body-bg',
  textTransform: 'capitalize',
  borderWidth: 0,
}


const NamespaceCharts = ({ namespaceData, namespace, isLoading, onChangeControl, onSearchControl }) => {
  const selectOptions = getTimeSelectOption()
  const [tmpText, setTmpText] = useState('');
  const filters = React.useMemo(
    () => [
      {
        id: 'type',
        label: 'Contact is lead',
        activeLabel: 'Contact',
        icon: <FiUser />,
        value: 'lead',
      },
      {
        id: 'type',
        label: 'Contact is customer',
        activeLabel: 'Contact',
        icon: <FiUser />,
        value: 'customer',
      },
    ],
    []
  )


  const onSearch = useDebouncedCallback(

    (q) => {
      onSearchControl(q)
      setTmpText(q)
    },
    [],
    500
  )

  // if (!namespaceData) {
  //   return <Text>No data available for {namespace}.</Text>;
  // }

  return (
    <FiltersProvider filters={filters}>
      <Page
        isLoading={isLoading}
        // borderRightWidth="1px"
        fontSize='sm'
        sx={{
          '& thead th': {
            ...stickyStyles,
            top: 0,
          },
          '& thead tr': {
            position: 'sticky',
            top: 0,
            zIndex: 0,

          },
          '& .sui-data-grid__pagination': {
            ...stickyStyles,
            bottom: 0,
            borderTopWidth: '1px',
          },
          '& tbody tr': {
            cursor: 'pointer',
            width: '50px'
          },
          '& tbody tr a:hover': {
            textDecoration: 'none',
          },
          '& tbody tr:last-of-type td': {
            borderBottomWidth: 0,
          },
        }}

      >
        <PageHeader id={"specialButon"}
    
          textAlign='start'
          // title={

          //   <Text fontWeight="semibold" fontSize='md' marginInlineEnd='4'></Text>}
          toolbar={<Toolbar>
            <Flex align="center" justify="space-between" width="full">
              <Flex flex="1" justify="flex-end" mr={"15px"}>
                {/* Empty Flex Box for spacing */}
                <FiltersAddButton label="Tags / Resources" />
                <Spacer />
                <Spacer />


              </Flex>

              <Box flex="1" display="flex" justifyContent="center">
                <SearchInput
                  size="sm"
                  width={{
                    base: "full",
                    lg: 750,
                  }}
                  onChange={(e) => { onSearch(e.target.value) }}
                  onReset={() => { onSearchControl('') }}

                />
              </Box>
              <Box ml={4} />
              <Flex flex="1" justify="flex-end">


                <Select
                  name="timeRange"
                  variant="outline"
                  defaultValue={"all"}
                  size="sm"
                  options={selectOptions}
                  onChange={(datas) => {
                    const obj = datas != "all" ? getTimeRange(datas) : {};
                    onChangeControl(obj)

                  }}

                >
                  <SelectButton />
                  <SelectList zIndex={2} />
                </Select>
                <Box ml={4} />

              </Flex>
            </Flex>
          </Toolbar>}
        />

        <PageBody contentWidth="full" maxHeight="800px" overflowY='auto' paddingTop={"5"} p={"5"}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6} templateAreas={`"header header"
               `}>

            <GridItem pl='2' area={'header'} >
              <ActiveFiltersList />

            </GridItem>
            {
              (namespaceData && Object.entries(namespaceData).length > 0) ? (
                Object.entries(namespaceData).map(([metricName, data]) => (
                  <GridItem key={metricName} w="full" minW="500px">
                    {console.log('data',data)}
                    <NamespaceMetricsChart data={data} metricName={metricName} />
                  </GridItem>
                ))
              )
                : tmpText != '' ? <EmptyState title="No data found" description="Try using other keywords for your search." /> : <div></div>
            }
          </Grid>
        </PageBody>
      </Page>
    </FiltersProvider>
  );
};

export default function Metrics() {
  const listRef = useRef(null);
  const [chartsData, setChartsData] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState(null);
  const [lazyParams, setLazyParams] = useState({
    searchText: "",
    first: 0,
    rows: 5,
    page: 0,
    sortField: "",
    sortOrder: 0,
    selectedClass: -1,
    isFilter: false,
    dates: {},
    filters: {}
  });

  // Access the client
  const queryClient = useQueryClient()


  // Queries
  const { isFetching, isLoading: metricDataLoading, error: metricDataError, data: metricData, refetch } = useQuery(
    {
      queryKey: ['getMetricsData', { selectedNamespace, lazyParams }],
      queryFn: ({ queryKey }) => getUniqueMatricsBasedOnNamespace(queryKey[1]),
      enabled: false,

    })
  const { isLoading: namespaceLoading, error: namespaceError, data: nameSpaceData } = useQuery(
    {
      queryKey: ['getNameSpaces'],
      queryFn: ({ queryKey }) => getAllNamespace()
    })


  const handleNamespaceClick = (namespace) => {
    setSelectedNamespace(namespace);

    // setLazyParams((prevParams) => ({
    //   ...prevParams,
    //   dates: {},
    // }));

    // Need to fix default focus issue of StructuredList

    // const element = document.getElementById('firstele');
    // const firstItem = element.querySelector('div')
    // if (firstItem && firstItem.hasAttribute('data-focus')) {
    //   // if the item exists
    //   firstItem.removeAttribute("data-focus"); // set the data-focus attribute to true
    // }




  };

  

  useEffect(() => {

    if (nameSpaceData) {
      handleNamespaceClick(nameSpaceData[0]?.namespace)

      // Need to fix default focus issue of StructuredList
      if (listRef?.current) {
        const element = document?.getElementById('firstele'); // find the first item with data-focus attribute
        const firstItem = element?.querySelector('div')
        if (firstItem) {
          firstItem?.setAttribute("data-focus", "true"); // set the data-focus attribute to true
        }
      }
    }
  }, [nameSpaceData]);


  useEffect(() => {
    const data = metricData
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
      setChartsData(newChartsData);

      if (lazyParams.searchText && data.length > 0) {
        const distinctNamespaces = [...new Set(data.map(item => item.namespace))];
        queryClient.setQueryData(
          ['getNameSpaces'],
          // ✅ this is the way
          (oldData) =>
            oldData
              ? oldData?.filter(item => distinctNamespaces.includes(item.namespace))
              : oldData,
        )
      }

    }
  }, [metricData]);

  useEffect(() => { refetch() }, [selectedNamespace, lazyParams]);



  return (

    <SplitPage breakpoint="sm">
      <Page borderRightWidth="1px" width="30%" maxW="300px" mr="0">
        <PageHeader
          id={"specialButon"}        
          textAlign="start"
          gridAutoFlow="column"
          itemRef="ssss"
          title={
            <Text
              fontWeight="semibold"
              fontSize="md"
              marginInlineEnd="4"

            >
              Metrics Explorer
            </Text>
          }
        />
        <PageBody p="0" >
          <StructuredList ref={listRef} >
            {nameSpaceData?.map((item, index) => (
              <StructuredListItem
                onFocus={() => {
                  const element = document?.getElementById('firstele');
                  const firstItem = element?.querySelector('div')
                  if (firstItem && firstItem?.hasAttribute('data-focus')) {
                    // if the item exists
                    firstItem.removeAttribute("data-focus"); // set the data-focus attribute to true
                  }
                }}
                key={item?.namespace + index}
                onClick={() => handleNamespaceClick(item?.namespace)}
                id={index == 0 ? 'firstele' : index}

              >
                <StructuredListCell  >
                  <Text>{item?.namespace}</Text>
                </StructuredListCell>
              </StructuredListItem>
            ))}
          </StructuredList>
        </PageBody>
      </Page>

      {selectedNamespace ? (
        <NamespaceCharts
          isLoading={metricDataLoading}
          namespaceData={chartsData[selectedNamespace]}
          namespace={selectedNamespace}
          onSearchControl={(data) => {
            if (!data) {
              queryClient.invalidateQueries(['getNameSpaces'])
            }
            setLazyParams((prevParams) => ({
              ...prevParams,
              searchText: data,
            }));
          }}
          onChangeControl={(data) => {
            setLazyParams((prevParams) => ({
              ...prevParams,
              dates: data,
            }));
          }}

        />
      ) : namespaceLoading ? (
        <LoadingOverlay  >
          <LoadingSpinner />
          <LoadingText>Please wait...</LoadingText>
        </LoadingOverlay>
      ) : (
        <Text>Please select a namespace.</Text>
      )}

    </SplitPage>

  );
}