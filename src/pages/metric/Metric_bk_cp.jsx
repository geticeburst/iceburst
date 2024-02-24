import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Spacer,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Text,
  useDisclosure,
  useColorModeValue,
  MenuOptionGroup,
  MenuItemOption,
  filter,
  Card,
  CardBody,
  CardHeader,
  Heading
} from "@chakra-ui/react";

import {
  AppShell,
  Sidebar,
  Navbar,
  NavbarBrand,
  SearchInput,
  OverflowMenu,
  useModals,
  Select,
  SelectButton,
  SelectList,
  useSnackbar,
  StructuredList,
  StructuredListHeader,
  StructuredListItem,
  StructuredListIcon,
  StructuredListButton,
  StructuredListCell,

} from "@saas-ui/react";
import { AreaChart } from '@saas-ui/charts'

import { Property } from "@saas-ui/react";

import { Aside, AsideHeader, FiltersAddButton } from "@saas-ui-pro/react";

import {
  FiAlertTriangle,
  FiList,
  FiCopy,
  FiSliders,
  FiSidebar,
  FiCircle,
  FiTag,
} from "react-icons/fi";

import { TbLambda, TbApi, TbPlugConnected, TbBrandAws } from "react-icons/tb";

import {
  Page,
  PageHeader,
  PageBody,
  SplitPage,
  DataGrid,
  DataGridPagination,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  FiltersProvider,
  ActiveFiltersList,
  ResetFilters,
  useColumnVisibility,
} from "@saas-ui-pro/react";

import "../../Mod.css";
import { getLogs } from "../../services/logs";

import { useQuery, useQueryClient } from "@tanstack/react-query";

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

import {
  DateRangePicker,
  DateRangePickerCalendar,
  DatePickerTrigger,
  DatePickerDialog,
  DateRangePickerTimeField,
} from "@saas-ui/date-picker";

import useInfiniteScroll from "react-infinite-scroll-hook";
import "react-json-view-lite/dist/index.css";

dayjs.extend(utc); // Enable the UTC plugin
dayjs.extend(timezone);

const data = [
  {
    date: 'Jan 1',
    Revenue: 1475,
  },
  {
    date: 'Jan 8',
    Revenue: 1936,
  },
  {
    date: 'Jan 15',
    Revenue: 1555,
  },
  {
    date: 'Jan 22',
    Revenue: 1557,
  },
  {
    date: 'Jan 29',
    Revenue: 1977,
  },
  {
    date: 'Feb 5',
    Revenue: 2315,
  },
  {
    date: 'Feb 12',
    Revenue: 1736,
  },
  {
    date: 'Feb 19',
    Revenue: 1981,
  },
  {
    date: 'Feb 26',
    Revenue: 2581,
  },
  {
    date: 'Mar 5',
    Revenue: 2592,
  },
  {
    date: 'Mar 12',
    Revenue: 2635,
  },
  {
    date: 'Mar 19',
    Revenue: 2074,
  },
  {
    date: 'Mar 26',
    Revenue: 2984,
  },
  {
    date: 'Apr 2',
    Revenue: 2254,
  },
  {
    date: 'Apr 9',
    Revenue: 3159,
  },
  {
    date: 'Apr 16',
    Revenue: 2804,
  },
  {
    date: 'Apr 23',
    Revenue: 2602,
  },
  {
    date: 'Apr 30',
    Revenue: 2840,
  },
  {
    date: 'May 7',
    Revenue: 3299,
  },
  {
    date: 'May 14',
    Revenue: 3487,
  },
  {
    date: 'May 21',
    Revenue: 3439,
  },
  {
    date: 'May 28',
    Revenue: 3095,
  },
  {
    date: 'Jun 4',
    Revenue: 3252,
  },
  {
    date: 'Jun 11',
    Revenue: 4096,
  },
  {
    date: 'Jun 18',
    Revenue: 4193,
  },
  {
    date: 'Jun 25',
    Revenue: 4759,
  },
]
const valueFormatter = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const service_list_data = ["AWS/Logs",
  "AWS/Events",
  "AWS/SQS",
  "AWS/ElasticBeanstalk",
  "AWS/App1icationELB ",
  "AWS/Firehose",
  'AWS/EBS',
  "AWS/EC2",
  "AWS/Lambda",
  "AWS/DynamoDB",
  "AWS/ApiGateway",
  "AUS/SNS",
  "AWS/ELB"]
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
const stickyStyles = {
  position: 'sticky',
  zIndex: 1,
  bg: 'chakra-body-bg',
  textTransform: 'capitalize',
  borderWidth: 0,
}

function ServiceList() {
  return (
    <Card w={'auto'} background={'transparent'} border={'none'}>

      <StructuredList >
        {
          service_list_data.map((item, index) => {
            return <StructuredListItem key={index} href="#">

              <StructuredListCell flex="1">
                <Text fontWeight="500">{item}</Text>
              </StructuredListCell>

            </StructuredListItem>
          })
        }


      </StructuredList>
    </Card>
  )
}

function InboxMessage() {


  return (
    <Page

      // borderRightWidth="1px"
      fontSize='sm'


    >
      <PageHeader id={"specialButon"}
        borderColor="--chakra-colors-blackAlpha-200"
        borderBottomWidth='1px'
        textAlign='start'
        title={<Text fontWeight="semibold" fontSize='md' marginInlineEnd='4'>right</Text>}

      />
      <PageBody contentWidth="100%" paddingTop={"5"} >
      <Card>
      <CardHeader pb="0">
        <Heading as="h4" fontWeight="medium" size="md">
          Revenue over time
        </Heading>
      </CardHeader>
      <CardBody>
        <AreaChart
          data={data}
          categories={['Revenue']}
          valueFormatter={valueFormatter}
          yAxisWidth={80}
          height="300px"
        />
      </CardBody>
    </Card>
      </PageBody>
    </Page>
  )
}

function Metric() {
  return (

    <SplitPage


    >
      <Page

        borderRightWidth="1px" width="30%" maxW="300px"
        fontSize='sm'

      >
        <PageHeader id={"specialButon"}
          borderColor="--chakra-colors-blackAlpha-200"
          borderBottomWidth='1px'


          title={<Text fontWeight="semibold" fontSize='md' marginInlineEnd='4'>Metrics</Text>}

        />
        <PageBody paddingTop={"5"} >
          <ServiceList />
        </PageBody>
      </Page>
      <InboxMessage />
    </SplitPage>

  );
}

export default Metric;
