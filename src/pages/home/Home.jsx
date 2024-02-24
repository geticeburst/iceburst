import React, { useEffect, useState } from "react";
import {
  Box,
  Spacer,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Flex,
  Container,
  Text,
  background,
  TabList,
  Tab,
  Tabs,
  HStack,
  Tag,
  useColorModeValue,
  Badge,
  MenuOptionGroup,
  MenuItemOption,
  Card,
  CardBody,
  useDisclosure,
} from "@chakra-ui/react";

import {
  AppShell,
  Sidebar,
  SidebarToggleButton,
  SidebarSection,
  NavItem,
  PersonaAvatar,
  SearchInput,
  OverflowMenu,
  useModals,
  useSnackbar,
  Select,
  SelectButton,
  SelectList,
  SelectOption,
  LoadingOverlay,
  LoadingSpinner,
  LoadingText,
} from "@saas-ui/react";
import {
  DateRangePicker,
  DateRangePickerCalendar,
  DatePickerTrigger,
  DatePickerDialog,
  DateRangePickerTimeField,
} from "@saas-ui/date-picker";
import { PropertyList, Property } from "@saas-ui/react";

import {
  FiHome,
  FiUsers,
  FiSettings,
  FiX,
  FiSearch,
  FiUser,
  FiCircle,
  FiCloud,
  FiBox,
  FiServer,
  FiAlertTriangle,
  FiList,
  FiCopy,
  FiSliders,
  FiSidebar,
  FiTag,
} from "react-icons/fi";
import { TbLambda, TbApi, TbPlugConnected, TbBrandAws } from "react-icons/tb";
import { Aside, AsideHeader, FiltersAddButton } from "@saas-ui-pro/react";
import {
  Page,
  PageHeader,
  PageBody,
  DataGrid,
  DataGridPagination,
  Toolbar,
  ToolbarButton,
  ToggleButton,
  ToggleButtonGroup,
  useColumns,
  getDataGridFilter,
  FiltersProvider,
  ActiveFiltersList,
  ResetFilters,
  useColumnVisibility,
} from "@saas-ui-pro/react";
import "../../Mod.css";
import { getLogs } from "../../services/logs";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { useDebouncedCallback } from "@react-hookz/web";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  getTimeSelectOption,
  getTimeRange,
  useLoadItems,
} from "../../utils/utils";
dayjs.extend(utc); // Enable the UTC plugin
dayjs.extend(timezone);
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useInView } from "react-intersection-observer";
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

function isTimestampInDesiredFormat(timestamp) {
  // Regular expression to check if the timestamp is already in the desired format
  const regex = /^\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2}$/;
  return regex.test(timestamp);
}

function formatTimestamp(timestamp) {
  // Check if the timestamp is a number (epoch format)
  if (!isNaN(timestamp) && !isNaN(parseFloat(timestamp))) {
    return dayjs(parseInt(timestamp)).format("DD MMMM YYYY HH:mm:ss");
  } else if (!isTimestampInDesiredFormat(timestamp)) {
    // If it's in any other format, convert it to the desired format
    return dayjs(timestamp).format("DD MMMM YYYY HH:mm:ss");
  }
  return timestamp; // Return as is if it's already in the desired format
}

function LogDetails({ log }) {
  if (!log) return <Box> No log selected </Box>;

  const logEntries = Object.entries(log).map(([key, value]) => {
    const formattedValue = key === "timestamp" ? dayjs(value).format() : value;

    return <Property key={key} label={key} value={String(formattedValue)} />;
  });

  return (
    <Box as="main" flex="1" py="2" px="4" overflowY="auto">
      {Object.entries(log).map(([key, value]) => (
        <RenderProperty key={key} propKey={key} propValue={value} />
      ))}
    </Box>
  );
}

const RenderProperty = ({ propKey, propValue }) => {
  const keyStyles = {
    fontSize: "14px",
    color: "gray.500",
    fontWeight: "bold",
    mr: 2,
    textTransform: "uppercase",
  };

  const valueStyles = {
    fontSize: "12px",
    color: "gray.100",
    fontFamily:
      "'SFMono-Regular', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  };

  const containerStyles = {
    borderBottom: "1px",
    borderColor: "gray.700",
    pb: 2,
    mb: 2,
    position: "relative",
  };

  const snackbar = useSnackbar();

  const copyToClipboard = (str) => {
    navigator.clipboard
      .writeText(str)
      .then(() => {
        snackbar({
          title: "Copied to Clipboard",
          description: `${propKey} value copied`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  if (
    typeof propValue === "object" &&
    propValue !== null &&
    !(propValue instanceof Date)
  ) {
    return (
      <Box {...containerStyles}>
        <Text {...keyStyles}> {propKey}: </Text>
        <Box ml={4}>
          {/* ml: margin left */}
          {Object.entries(propValue).map(([key, value]) => (
            <RenderProperty key={key} propKey={key} propValue={value} />
          ))}
        </Box>
      </Box>
    );
  }

  const valueToDisplay =
    propKey === "timestamp" ? formatTimestamp(propValue) : String(propValue);

  return (
    <Box {...containerStyles} className="container">
      <Text as="span" {...keyStyles}>
        {propKey}:
      </Text>
      <Text as="span" {...valueStyles}>
        {valueToDisplay}
      </Text>
      <IconButton
        aria-label="Copy"
        icon={<FiCopy />}
        className="copy-icon"
        size="xs"
        onClick={() => copyToClipboard(valueToDisplay)}
        variant="ghost"
        marginLeft={2}
        top="50%"
        visibility="hidden"
      />
    </Box>
  );
};

function Home() {
  const { ref, inView } = useInView();
  const [dateFilter, SetDatefilter] = useState(1);
  const [gridLoad, SetGridLoad] = useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [currentRow, setCurrentRow] = React.useState();
  const selectOptions = getTimeSelectOption();
  const modals = useModals();
  const [activeComponent, setActiveComponent] = useState("select");

  const handleToggleChange = (value) => {
    setActiveComponent(value);
  };

  // const { loading, items, hasNextPage, error: ScrollError, loadMore } = useLoadItems();

  // const [sentryRef] = useInfiniteScroll({
  //     loading,
  //     hasNextPage,
  //     onLoadMore: loadMore,
  //     // When there is an error, we stop infinite loading.
  //     // It can be reactivated by setting "error" state as undefined.
  //     disabled: !!ScrollError,
  //     // `rootMargin` is passed to `IntersectionObserver`.
  //     // We can use it to trigger 'onLoadMore' when the sentry comes near to become
  //     // visible, instead of becoming fully visible on the screen.
  //     rootMargin: '0px 0px 400px 0px',
  // });
  const pageSize = 100;

  const [lazyParams, setLazyParams] = useState({
    searchText: "Error",
    limit: 10,
    offset: 1,
    first: 0,
    rows: 5,
    page: 0,
    sortField: "",
    sortOrder: 0,
    selectedClass: -1,
    isFilter: false,
    dates: {},
    filters: {},
  });

  // Access the client
  const queryClient = useQueryClient();

  // Queries
  // const { isLoading, error, data } = useQuery({ queryKey: ['getLogs', { searchQuery, page, lazyParams }], queryFn: ({ queryKey }) => getLogs(queryKey[1]) })

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["getLogs", { searchQuery, page, lazyParams }],
    queryFn: ({ queryKey, pageParam }) =>
      getLogs({ ...queryKey[1], pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage?.data?.length ? allPages.length + 1 : undefined;

      return nextPage;

      // lastPage.nextCursor
      // Implement logic to determine the next page number
      // e.g., return lastPage.nextPage if available, or null if no more pages
    },
  });

  // const logs2 = data?.pages?.reduce((acc, page) => {
  //     return [...acc, page.data]
  // }, [])
  const logs = data?.pages?.flatMap((page) => page.data) || [];
  const latestFetchedPage = data?.pages?.[data.pages.length - 1];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const headerHeight = "57px";

  const stickyStyles = {
    position: "sticky",
    zIndex: 1,
    bg: "chakra-body-bg",
    textTransform: "capitalize",
    borderWidth: 0,
  };

  // Fetch the next page in advance and store it in the cache
  // const prefetchNextPage = async (pageIndex) => {
  //     const nextPage = pageIndex + 1; // You can calculate the next page based on your logic
  //     await queryClient.prefetchQuery(['getLogs', { searchQuery, nextPage, lazyParams }], (queryKey) => getLogs(queryKey[1]));
  // };

  // Handle the next page loading
  //   const handleNextPage = (pageIndex) => {
  //     setPage(pageIndex)
  //     prefetchNextPage(pageIndex);
  //     // Update your UI to use the prefetched data
  //   };
  // Prefetch the next page data
  // React.useEffect(() => {
  //     if (data) {
  //         queryClient.prefetchQuery({
  //             queryKey: ['getLogs', { searchQuery, page: page + 1, lazyParams }],
  //             queryFn: ({ queryKey }) => getLogs({ ...queryKey[1], page: page + 1 }),
  //         });
  //     }
  // }, [data, page, queryClient, searchQuery, lazyParams]);

  // Define a function to generate columns based on the schema
  const generateColumns = (schema) => {
    return Object.keys(schema).map((columnName) => {
      const dataType = schema[columnName];

      // Customize this part based on your data types and requirements
      let columnConfig = {
        accessorKey: columnName,
        size: 200,
        header: columnName,
        cell: (cell) => {
          const value = cell.getValue();
          const truncatedValue =
            value?.length > 100 ? value.slice(0, 200) + "..." : value;

          return <Text color="muted">{truncatedValue}</Text>;
        },
      };

      if (dataType === "timestamp") {
        columnConfig = {
          ...columnConfig,
          cell: (cell) => (
            <Text color="muted">{dayjs(cell.getValue()).format()}</Text>
          ),
          filterFn: getDataGridFilter("date"),
          enableGlobalFilter: false,
        };
      } else if (dataType === "array<string>") {
        columnConfig = {
          ...columnConfig,
          cell: (cell) => (
            <HStack>
              {cell.getValue()?.map((tag) => (
                <Tag size="sm" key={Math.random()} colorScheme="gray" h="6">
                  <Badge bg={"blue"} boxSize="2" rounded="full" me="1" />
                  <Text>{tag}</Text>
                </Tag>
              ))}
            </HStack>
          ),
          filterFn: getDataGridFilter("string"),
          enableGlobalFilter: false,
        };
      }

      return columnConfig;
    });
  };

  // const [visibleColumns, setVisibleColumns] = React.useState(['id', 'timestamp', 'message'])

  // const columns = React.useMemo(() => {
  //     const check_schema = latestFetchedPage ? latestFetchedPage : {}
  //     if (check_schema && check_schema.schema) {
  //         const x = generateColumns(check_schema.schema);
  //         // setVisibleColumns(['id', 'timestamp', 'message'])
  //         SetGridLoad(false)
  //         return x
  //     }

  //     return []

  // }, [data])

  // const filterKeys = ['id', 'timestamp', 'message'];

  // const columnVisibility = useColumnVisibility({
  //     columns: columns,
  //     visibleColumns: visibleColumns,

  // })

  const filter_s = React.useMemo(() => {
    const apiResponse = latestFetchedPage ? latestFetchedPage : {};

    if (!isLoading) {
      return Object.keys(apiResponse.filters).map((filterKey, index) => {
        const filterValues = apiResponse.filters[filterKey];
        // Determine the type of filter based on the data
        let type = "enum";
        if (filterValues.every((value) => typeof value === "boolean")) {
          type = "boolean";
        }

                // Build the filter object
                const filter = {
                    id: filterKey,
                    label: filterKey,
                    type,
                    items: filterValues.map((value, valueIndex) => ({
                        id: value,
                        label: value,
                        fontSize: 'sm'
                        // You can add the icon and other properties here as needed
                    })),
                };

        return filter;
      });
    }
  }, [data]);

  const [selectedLog, setSelectedLog] = useState(null);
  const sidebar = useDisclosure();

  const handleSidebarOpen = (log) => {
    setSelectedLog(log);
    sidebar.onOpen();
  };

  const [dynamicColumns, setDynamicColumns] = useState([]);

  useEffect(() => {
    const check_schema = latestFetchedPage ? latestFetchedPage : {};
    if (check_schema && check_schema.schema) {
      const firstItem = check_schema.schema;
      const columnKeys = Object.keys(firstItem);

      const newColumns = columnKeys.map((key) => {
        if (key === "timestamp") {
          return {
            header: "Timestamp",
            accessorKey: "timestamp",
            cell: (cell) => (
              <Text color="muted"> {formatTimestamp(cell.getValue())} </Text>
            ),
          };
        } else {
          return {
            header: key,
            accessorKey: key,
            size: 200,
            cell: (cell) => {
              const value = cell.getValue();
              const truncatedValue =
                value?.length > 100 ? value.slice(0, 200) + "..." : value;

              return <Text color="muted">{truncatedValue}</Text>;
            },
          };
        }
      });

      setDynamicColumns(newColumns);
    }
  }, [data]);

  const [visibleColumns, setVisibleColumns] = React.useState([
    "id",
    "timestamp",
    "message",
  ]);

  useEffect(() => {
    // setVisibleColumns(dynamicColumns.map((c) => c.accessorKey));
    setVisibleColumns(["id", "timestamp", "message"]);
  }, [dynamicColumns]);

  const columnVisibility = useColumnVisibility({
    columns: dynamicColumns,
    visibleColumns,
  });

  const onFilter = React.useCallback((filters) => {
    const newFilters = {};

    for (const filter of filters) {
      // Assuming 'id' should be the key and 'value' should be the value in 'filters'
      newFilters[filter.id] = filter.value;
    }

    // Update the state with the new filters
    setLazyParams((prevParams) => ({
      ...prevParams,
      filters: newFilters,
    }));
    // gridRef.current.setColumnFilters(
    //   filters.map((filter) => {
    //     return {
    //       id: filter.id,
    //       value: {
    //         value: filter.value,
    //         operator: filter.operator || 'is',
    //       },
    //     }
    //   })
    // )
  }, []);

  const hanldeModal = (data) => {
    const rawData = data?.original;
    const x = (
      <Box>
        <Card>
          <CardBody>
            <PropertyList>
              <Property
                label="TimeStamp"
                value={
                  <Text color="muted">
                    {dayjs(data.original.timestamp).format()}
                  </Text>
                }
              />
              <Property
                textTransform={"capitalize"}
                label="LogGroup"
                value={data.original.logGroup}
              />
              {Object.keys(rawData).map((columnName, index) => {
                return (
                  <Property
                    key={index + "id"}
                    label={
                      <Box textTransform="capitalize" className="">
                        {columnName}
                      </Box>
                    }
                    value={
                      <Box>
                        <Text
                          flexWrap="nowrap"
                          w="400px"
                          color="muted"
                          noOfLines={[1, 2, 3]}
                        >
                          {columnName.toLowerCase() == "timestamp"
                            ? dayjs(rawData[columnName]).format()
                            : rawData[columnName]}
                        </Text>
                      </Box>
                    }
                  />
                );
              })}
            </PropertyList>
            <Spacer />
            <JsonView
              data={rawData}
              shouldExpandNode={allExpanded}
              style={darkStyles}
            />
          </CardBody>
        </Card>
      </Box>
    );
    // const d = <div style={{width:"100px"}}><pre><code>{JSON.stringify(data.original, null, 3)}</code></pre></div>
    modals.drawer({
      title: data.original.id,
      body: x,
      size: "lg",
      allowPinchZoom: true,
      isCentered: true,
    });
  };
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const copySidebarContent = () => {
    const sidebarContent = Object.entries(selectedLog)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    navigator.clipboard
      .writeText(sidebarContent)
      .then(() => {
        setCopyButtonText("Copied");
        setTimeout(() => setCopyButtonText("Copy"), 3000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <FiltersProvider filters={filter_s} onChange={onFilter} zIndex={2}>
      <Page
        fontSize="sm"
        isLoading={isLoading}
        sx={{
          "& thead th": {
            ...stickyStyles,
            top: 0,
          },
          "& thead tr": {
            position: "sticky",
            top: 0,
            zIndex: 0,
            boxShadow: useColorModeValue(
              "0 1px 2px 0 rgba(0, 0, 0, 0.08)",
              "0 1px 2px 0 rgba(255, 255, 255, 0.08)"
            ),
          },
          "& .sui-data-grid__pagination": {
            ...stickyStyles,
            bottom: 0,
            borderTopWidth: "1px",
          },
          "& tbody tr": {
            cursor: "pointer",
            width: "50px",
          },
          "& tbody tr a:hover": {
            textDecoration: "none",
          },
          "& tbody tr:last-of-type td": {
            borderBottomWidth: 0,
          },
        }}
      >
        {/* <Spacer /> */}
        <PageHeader
          // description="moto"

                    id={"specialButon"}
                    textAlign='start'
                    gridAutoFlow='column'
                    itemRef='ssss'
                    title={<Text fontWeight="semibold" fontSize='md' marginInlineEnd='4'>Logs</Text>}

                    toolbar={

                        <Toolbar>
                            <Flex align="center" justify="space-between" width="full">
                                <Flex flex="1" justify="flex-end">
                                    {/* Empty Flex Box for spacing */}
                                </Flex>

                                <Box flex="1" display="flex" justifyContent="center">
                                    <SearchInput
                                        size="sm"
                                        width={{
                                            base: "full",
                                            lg: 750,
                                        }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onReset={() => setSearchQuery("")}
                                    />
                                </Box>
                                <Box ml={4} />
                                <Flex flex="1" justify="flex-end">


                                    {activeComponent === 'select' ? (
                                        <Select
                                            name="timeRange"
                                            variant="outline"
                                            defaultValue="Last hour"
                                            size="sm"
                                            options={selectOptions}
                                            onChange={(datas) => {
                                                const obj = datas != "all" ? getTimeRange(datas) : {};

                                                // Update the state with the new filters
                                                setLazyParams((prevParams) => ({
                                                    ...prevParams,
                                                    dates: obj,
                                                }));
                                            }}
                                        >
                                        </Select>
                                    ) : (
                                        <DateRangePicker granularity="minute">
                                            {/* Your existing DateRangePicker children */}
                                        </DateRangePicker>
                                    )}
                                    <Select
                                        name="timeRange"
                                        variant="outline"
                                        defaultValue="Last hour"
                                        size="sm"
                                        options={selectOptions}
                                        onChange={(datas) => {
                                            const obj = datas != "all" ? getTimeRange(datas) : {};
                                            // Update the state with the new filters
                                            setLazyParams((prevParams) => ({
                                                ...prevParams,
                                                dates: obj,
                                            }));
                                        }}
                                    >
                                        <SelectButton />
                                        <SelectList zIndex={2} />
                                    </Select>
                                    <Box ml={4} />
                                    <DateRangePicker granularity="minute">
                                        <DatePickerTrigger>
                                            <Button>Custom</Button>
                                        </DatePickerTrigger>
                                        <DatePickerDialog>
                                            <DateRangePickerCalendar />
                                            <DateRangePickerTimeField />
                                        </DatePickerDialog>
                                    </DateRangePicker>
                                    <Box ml={4} />
                                    <Menu closeOnSelect={false} >
                                        <MenuButton
                                            as={Button}
                                            leftIcon={
                                                <FiSliders
                                                    style={{
                                                        transform: "rotate(90deg)",
                                                    }}
                                                />
                                            }
                                        >
                                            View
                                        </MenuButton>
                                        <MenuList zIndex={2}  fontSize={'md'} >
                                            <Box px={4} py={2}>
                                                <Text fontWeight="bold" fontSize="md">
                                                    Toggle columns
                                                </Text>
                                            </Box>
                                            <MenuOptionGroup



                                                value={visibleColumns}
                                                type="checkbox"
                                                onChange={setVisibleColumns}
                                                close
                                            >
                                                {dynamicColumns.map((c) => {
                                                    return (
                                                        <MenuItemOption

                                                            value={c.accessorKey}
                                                            key={c.accessorKey}
                                                        >
                                                            {c.accessorKey}
                                                        </MenuItemOption>
                                                    );
                                                })}
                                            </MenuOptionGroup>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                            </Flex>
                        </Toolbar>


                    }
                    footer={<Box >
                        <Toolbar variant='outline' >

                            <ToggleButtonGroup

                                fontSize='sm'
                                fontWeight='semibold'
                                type="radio"
                               
                                defaultValue="1"
                                onChange={(e) => {
                                    let searchParam = ""
                                    if (e == 1) {
                                        searchParam = "Error"
                                    }
                                    SetDatefilter(e)

                                    // Update the state with the new filters
                                    setLazyParams((prevParams) => ({
                                        ...prevParams,
                                        searchText: searchParam,
                                    }));

                                }}
                            >
                                <ToggleButton value="1" className={dateFilter == "1" && 'selected'} aria-selected={dateFilter == "1" ? true : false}>Error </ToggleButton>
                                <ToggleButton value="2" className={dateFilter == "2" && 'selected'} aria-selected={dateFilter == "2" ? true : false }>Live </ToggleButton>

                            </ToggleButtonGroup>
                            <Spacer />




                            <FiltersAddButton />
                            <Spacer />

                        </Toolbar>
                    </Box>}

                />

        <ActiveFiltersList
          size="sm"
          paddingInlineStart={4}
          paddingInlineEnd="4"
          paddingTop={2}
          paddingBottom={2}
          borderBottomWidth={1}
          zIndex={2}
        >
          <Spacer />
          <ResetFilters>Clear all</ResetFilters>
        </ActiveFiltersList>
        <PageBody contentWidth="full" p="0" maxHeight="800px" overflowY="auto">
          <DataGrid
            initialState={{
              pagination: {
                pageSize: latestFetchedPage?.total, // (latestFetchedPage?.page_size *  (latestFetchedPage?.page_no == 0 ? 1 : latestFetchedPage?.page_no)) + 100,
                pageIndex: latestFetchedPage?.page_no,
              },
            }}
            // pageCount={Math.ceil(data?.pages?.[0].total / data?.pages?.[0].page_size)}
            // isHoverable
            state={{
              columnVisibility,
            }}
            // isSelectable
            // isSortable

            columns={dynamicColumns}
            data={logs ? logs : []}
            onRowClick={
              (row) => {
                handleSidebarOpen(row.original);
              }
              // (row, e) => {
              // hanldeModal(row)
              // // Find the first A and trigger a click.
              // const link = e.currentTarget.querySelector('td a')
              // link && link.click()
            }
            // ref={sentryRef}
          >
            {/* <DataGridPagination

                            onChange={({ pageIndex }) => { setPage(pageIndex) }} /> */}
            {hasNextPage && (
              <div ref={ref}>
                <LoadingOverlay>
                  <LoadingSpinner />
                  <LoadingText>Loading...</LoadingText>
                </LoadingOverlay>
              </div>
            )}
          </DataGrid>
        </PageBody>
      </Page>
      <Aside
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        defaultWidth="400px"
        minWidth="300px"
        maxWidth={{
          base: "80%",
          lg: "500px",
        }}
        position={{
          base: "fixed",
          lg: "fixed",
        }}
        top={headerHeight}
        bottom="0"
        height={`calc(100vh - ${headerHeight})`}
        right={sidebar.isOpen ? "0" : "-100%"} // Slide in from the right
        zIndex="docked"
        boxShadow="md"
        bg="white"
        _dark={{
          bg: "gray.800",
        }}
        borderLeftWidth="1px"
        isResizable
        size="lg"
      >
        <AsideHeader position="relative" p={4}>
          <Box position="absolute" right={4} top={2}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={<FiSidebar />}
              onClick={() =>
                sidebar.isOpen ? sidebar.onClose() : sidebar.onOpen()
              }
              size="xs"
              variant="ghost"
            />
          </Box>
          <Button onClick={copySidebarContent} size="xs" variant="outline">
            {copyButtonText}
          </Button>
        </AsideHeader>
        <LogDetails log={selectedLog} />
      </Aside>
    </FiltersProvider>
  );
}

export default Home;
