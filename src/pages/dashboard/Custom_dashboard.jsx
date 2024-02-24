import { useEffect, useState, useRef } from "react";
import { Card, CardBody, CardHeader, Heading, Grid, GridItem, Box, Text, Flex, Spacer, Button } from "@chakra-ui/react";
import { Page, PageHeader, PageBody, SplitPage, Toolbar } from "@saas-ui-pro/react";
import { SearchInput, StructuredList, StructuredListItem, StructuredListCell, LoadingOverlay, LoadingSpinner, LoadingText } from "@saas-ui/react";
import { FiPlusCircle, FiLayout, FiXCircle } from 'react-icons/fi'
import { RiDeleteBinLine } from "react-icons/ri";
import { AreaChart, BarChart, LineChart } from "@saas-ui/charts";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import LocalStorageService, { generateChartData, } from '../../utils/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllNamespace, getUniqueMatricsBasedOnNamespace } from "../../services/metrics";
import { useDebouncedCallback } from "@react-hookz/web";
import { Select } from "chakra-react-select";
import { useModals } from '@saas-ui/react'
import { useSnackbar } from '@saas-ui/react'
import { addDashboard, deleteDashboardRecord, fetchDashboardData, fetchDashboardNames, updateDashboard } from "../../services/dashboards";


dayjs.extend(utc); // Enable the UTC plugin
dayjs.extend(timezone);

const valueFormatter = (value) => {
  return value;
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


const NamespaceMetricsChart = ({ metricName = "", data, isEditMode = true, onAddChart, onRemoveChart, selectOptionData }) => {
  const modals = useModals()
  let tmpSelectedValue = null
  const handleSelectChange = (selectedOption) => {
    tmpSelectedValue = selectedOption
  };


  const handleModalClose = () => {

    // Pass selected value to parent component when modal is closed
    onAddChart(tmpSelectedValue);

    modals.closeAll(); // Close the modal
  };

  return (
    <Card w="100%" maxW="xl">
      <CardHeader pb="0">
        <Heading as="h4" fontWeight="medium" size="md">
          <Flex align="end" justify="space-between" width="full">
            <Text>
              {metricName ? `${metricName.value} [${metricName.group}]` : ""}
            </Text>
            {
              (metricName && isEditMode) &&
              <Button
                size={'sm'}
                variant={'outline'}
                onClick={() => { onRemoveChart(metricName) }}>
                <FiXCircle />
              </Button>
            }
          </Flex>
        </Heading>
      </CardHeader>
      <CardBody alignContent={'center'}>
        {/* {renderChart(metricName, data)} */}

        {metricName != "" ? renderChart(metricName.value, data) : <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="330px"
          width="100%"
        >
          <Button
            onClick={() =>
              modals.open({
                title: 'Add chart',
                body: <Select
                  selectedOptionColorScheme="purple"
                  closeMenuOnSelect={true}
                  onChange={handleSelectChange}
                  options={selectOptionData}
                  placeholder="Select chart..."
                  selectedOptionStyle="check"
                  groupedSelected
                />,
                footer: <Button onClick={handleModalClose}>Done</Button>,
              })
            }
          >
            <FiPlusCircle />
            <Spacer />
            <Text m='5'>Click here to add chart</Text>
          </Button>

        </Box>}
      </CardBody>
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


const NamespaceCharts = ({ chartData, selectedDashboard, refetchDashboardName, isLoading, selectOptionData, allDashBoards }) => {
  const snackbar = useSnackbar({ isClosable: true, })
  const searchInputRef = useRef();
  const [dashboardName, setDashboardName] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [tmpChart, setTmpChart] = useState([]);


  useEffect(() => {

    if (chartData?.length > 0) {

      setTmpChart(chartData)
      setDashboardName(selectedDashboard?.title)
      setIsEditMode(false)
    } else {
      restScreen()


    }
  }, [chartData]);


  const handleAddChart = async (data) => {



    // Check for duplicate combination of group and value
    const isDuplicate = tmpChart.some(item => item.group === data.group && item.value === data.value);

    if (isDuplicate) {
      snackbar.error("The chart already exists.")
      return
    }

    // Filter out the item with isActive: false
    const qeryParam = {
      "namespace": data.group,
      "metricName": data.value
    }
    const result = await getUniqueMatricsBasedOnNamespace(qeryParam)
    const chartData = generateChartData(result)

    // Update the tmpChart state with the new data
    setTmpChart(prevCount => [
      ...prevCount,
      { group: data.group, value: data.value, data: chartData[data.value] },
    ]);
  };

  const handleRemoveChart = (data) => {
    // Filter out the item with the specified group and value
    const { group, value } = data
    const updatedCount = tmpChart.filter(item => !(item.group === group && item.value === value));
    setTmpChart(updatedCount);
  };

  const restScreen = () => {
    setTmpChart([])
    onSearch('')
    setIsEditMode(true)


  }

  const handleSaveDashboard = async () => {

    const isUpdateRequest = selectedDashboard ? true : false


    if (tmpChart.length === 0) {
      snackbar.error('Cannot save dashboard with no chart data.');
      return

    }

    const chartsToSave = tmpChart.map(chart => {
      // Destructure the chart object to exclude the 'data' property
      const { data, ...chartWithoutData } = chart;
      return chartWithoutData;
    });



    // Get existing dashboards from local storage or initialize as an empty object
    const existingDashboards = allDashBoards?.find((record) => record.title === dashboardName);

    // Check if the dashboard name already exists
    if (existingDashboards && !isUpdateRequest) {
      snackbar.error(`Dashboard with name "${dashboardName}" already exists.`)
      return
    }


    const finalData = {
      title: dashboardName,
      user_id: "1d6e1cdf-a59d-4f8a-8156-aa880a28ed48",
      charts_data: chartsToSave,
    };

    console.log('finalData', finalData)
    console.log('selectedDashboard', selectedDashboard)
    console.log('isUpdateRequest', isUpdateRequest)


    let result = {}
    if (isUpdateRequest) {
      result = await updateDashboard(selectedDashboard.id, finalData)
    } else {
      result = await addDashboard(finalData)
    }
    console.log('result', result)

    if (result.error == null && chartData?.length == 0) {
      restScreen()
      snackbar.success('Dashboard created !!!')

    } else {
      setIsEditMode(false)
      snackbar.success('Dashboard updated !!!')

    }
    refetchDashboardName()

  }
  const onSearch = useDebouncedCallback((q) => { setDashboardName(q) }, [], 0)


  return (

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
        toolbar={<Toolbar>
          <Flex align="center" justify="space-between" width="full">

            <Box flex="1" display="flex" justifyContent="start">
              <SearchInput

                isDisabled={!isEditMode}
                ref={searchInputRef}
                placeholder={"Create new dashboard"}
                value={isLoading ? 'Please wait...' : dashboardName}
                size="sm"
                width={{
                  base: "full",
                  lg: 750,
                }}
                onChange={(e) => { onSearch(e.target.value) }}
                onReset={isEditMode ? () => onSearch('') : undefined}
                icon={<FiLayout />}


              />
            </Box>
            <Box ml={4} />
            <Flex flex="1" justify="flex-end">
              <Box ml={4} />
              <Spacer />

              {isEditMode ? <Button onClick={handleSaveDashboard} >Save</Button> :
                <Button onClick={() => { setIsEditMode(true) }} >Edit</Button>}

            </Flex>
          </Flex>
        </Toolbar>}
      />

      <PageBody contentWidth="full" maxHeight="800px" overflowY='auto' paddingTop={"5"} p={"5"}>
        <Grid templateColumns="repeat(2, 1fr)" gap={6} templateAreas={`"header header"`}>

          <GridItem pl='2' area={'header'} >


          </GridItem>

          {

            tmpChart.map((item, index) => (
              <GridItem key={index} w="full" minW="500px">
                <NamespaceMetricsChart
                  selectOptionData={selectOptionData}
                  data={item.data}
                  metricName={item}
                  isEditMode={isEditMode}
                  onRemoveChart={handleRemoveChart}
                />
              </GridItem>
            ))
          }
          {isEditMode && <GridItem key={'dummy'} w="full" minW="500px">
            <NamespaceMetricsChart
              selectOptionData={selectOptionData}
              onAddChart={handleAddChart}
            />
          </GridItem>}

        </Grid>
      </PageBody>
    </Page>

  );
};

export default function Dashboard() {
  const snackbar = useSnackbar({ isClosable: true, })
  const modal = useModals()
  const listRef = useRef(null);
  const [chartsData, setChartsData] = useState([]);
  const [selectData, setSelectData] = useState([]);
  const [isLoadings, setIsLoadings] = useState(false);
  const [dashboardDataPreparing, setDashboardDataPreparing] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);


  // Queries
  const { data: nameSpaceData } = useQuery(
    {
      queryKey: ['getNameSpaces'],
      queryFn: ({ queryKey }) => getAllNamespace()
    })

  // Queries
  const { data: dashBoardNames, refetch: refetchDashboardName } = useQuery(
    {
      queryKey: ['getDashbaords', {}],
      queryFn: ({ queryKey }) => fetchDashboardNames(queryKey[1]),

    })



  // Queries
  const { data: dashBoardData, refetch: refetchDashboardData } = useQuery(
    {
      queryKey: ['getDashbaordData', { selectedDashboard }],
      queryFn: ({ queryKey }) => fetchDashboardData(queryKey[1]),
      enabled: false

    })

  const handleDashboardNameClick = (namespace) => { setSelectedDashboard(namespace) };

  useEffect(() => {
    setIsLoadings(true);
    if (nameSpaceData) {
      (async () => {
        const groupedOptions = await Promise.all(nameSpaceData.map(async (item) => {

          const tmp = item.namespace
          const qeryParam = { selectedNamespace: tmp }
          const result = await getUniqueMatricsBasedOnNamespace(qeryParam)

          const metricNamesSet = new Set();
          result.forEach(metric => {
            metricNamesSet.add(metric.metricName);
          });
          const distinctMetricNames = Array.from(metricNamesSet);
          const options = distinctMetricNames.map(name => {
            return { value: name, label: name, group: item.namespace };
          });
          return { label: item.namespace, options: options };
        }));
        // Now groupedOptions contains the desired data structure
        setSelectData(groupedOptions)
        setIsLoadings(false)
        // You can use groupedOptions as per your requirement
      })();
    }


  }, [nameSpaceData]);



  useEffect(() => {
    console.log('selectedDashboard', selectedDashboard)
    if (selectedDashboard) {
      addChartDataToCharts(selectedDashboard.charts_data).then(updatedCharts => {
        setChartsData(updatedCharts)
        setDashboardDataPreparing(false)
      });
    }


  }, [selectedDashboard]);

  useEffect(() => {
    if (dashBoardData) {
      setDashboardDataPreparing(true)
      if (dashBoardData) {
        addChartDataToCharts(dashBoardData).then(updatedCharts => {
          setChartsData(updatedCharts)
          setDashboardDataPreparing(false)
        });
      }
    }

  }, [dashBoardData]);

  const addChartDataToCharts = async (dashBoardData) => {

    const updatedCharts = await Promise.all(dashBoardData.map(async (chartConfig) => {

      const qeryParam = {
        "namespace": chartConfig.group,
        "metricName": chartConfig.value
      }
      const result = await getUniqueMatricsBasedOnNamespace(qeryParam);
      const chartData = generateChartData(result)
      return { ...chartConfig, data: chartData[chartConfig.value] };
    }));
    return updatedCharts;
  };

  const handleRemoveDashboard = async (dashboardName) => {
    try {
      const result = await deleteDashboardRecord(selectedDashboard?.id)
  
      if (result?.error == null) {

        snackbar.success('Dashboard deleted !!!')

      }
      refetchDashboardName()
      setChartsData([])
    } catch (error) {
      snackbar.error('Error removing dashboard')
      console.error('Error removing dashboard ', error);
    }

  }
  return (

    <SplitPage breakpoint="sm">
      <Page borderRightWidth="1px" width="30%" maxW="300px" mr="0">
        <PageHeader
          id={"specialButon"}
          textAlign="start"
          gridAutoFlow="column"
          itemRef="ssss"


          title={
            <Flex align="center" justify="space-between" width="140%">
              <Text
                fontWeight="semibold"
                fontSize="md"
                marginInlineEnd="4"

              >
                Custom Dashboards

              </Text>
              <Spacer />
              <Button size='sm' colorScheme="purple" onClick={() => {
                setChartsData([])
                if (listRef?.current) {
                  const element = document?.getElementById(selectedDashboard);
                  const firstItem = element?.querySelector('div')
                  if (firstItem && firstItem?.hasAttribute('data-focus')) {
                    // if the item exists
                    firstItem.removeAttribute("data-focus"); // set the data-focus attribute to true
                  }
                }

              }}>  <FiPlusCircle /></Button>
            </Flex>

          }
        />
        <PageBody contentWidth="full" maxHeight="800px" overflowY='auto'  >
          <StructuredList ref={listRef} >

            {dashBoardNames?.map((item, index) => (
              <StructuredListItem
                id={item.title}
                key={item.title + index}
                onClick={() => handleDashboardNameClick(item)}

              >
                <StructuredListCell  >

                  <Text>{item.title}</Text>
                </StructuredListCell>
                <StructuredListCell>
                  <Button colorScheme='purple' variant='ghost' size='xs' onClick={() =>
                    modal.confirm({
                      title: 'Delete dashbord',
                      body: 'Are you sure you want to delete this dashboard?',
                      confirmProps: {
                        colorScheme: 'red',
                        label: 'Delete',
                      },
                      onConfirm: () => { handleRemoveDashboard(item.title) }, // action
                    })
                  }>
                    <RiDeleteBinLine /></Button>
                </StructuredListCell>
              </StructuredListItem>
            ))}
          </StructuredList>
        </PageBody>
      </Page>

      {!isLoadings ? (
        <NamespaceCharts
          isLoading={dashboardDataPreparing}
          selectOptionData={selectData}
          namespaceData={chartsData}
          chartData={chartsData}
          selectedDashboard={selectedDashboard}
          refetchDashboardName={refetchDashboardName}
          allDashBoards={dashBoardNames}

        />
      ) : isLoadings ? (
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