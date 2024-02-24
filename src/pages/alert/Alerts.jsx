import React, { useState, useEffect } from "react";
import {
	Button,
	useDisclosure,
	Drawer,
	Card,
	CardHeader,
	CardBody,
	Heading,
	Text,
	Box,
	Progress,
	DrawerBody,
	DrawerHeader,
	VStack,
	HStack,
	Editable,
	EditableInput,
	EditablePreview,
	Flex,
	Tag,
	TagLabel,
	TagCloseButton,
	TagRightIcon,
	IconButton,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	Tooltip,
	Input,
} from "@chakra-ui/react";
import PropertyCard from "../../components/PropertyCard";
import IssuesList from "../../components/IssuesList";
import OnCall from "../../components/OnCall";
import NotificationOptions from "../../components/NotificationOptions";
import AreaCharts from "../../components/AreaCharts";
import Personas from "../../components/Personas";
import { Select } from "chakra-react-select";
import {
	AppShell,
	Field,
	Form,
	StructuredList,
	StructuredListCell,
	StructuredListItem,
	FormLayout,
	Property,
	PropertyList,
	DisplayIf,
	SubmitButton,
} from "@saas-ui/react";
import supabase from "../../utils/supabaseClient";
import { SplitPage, Page, PageHeader, PageBody } from "@saas-ui-pro/react";
import {
	FiPlusCircle,
	FiMinusCircle,
	FiInfo,
	FiChevronDown,
	FiX,
} from "react-icons/fi";
import * as yup from "yup";


const stickyStyles = {
	position: 'sticky',
	zIndex: 1,
	bg: 'chakra-body-bg',
	textTransform: 'capitalize',
	borderWidth: 0,
}


const schema = yup.object().shape({
	alertName: yup.string().required("Alert name is required"),
	alertType: yup.string().required("Type of alert is required"),
	metrics: yup.array().of(
		yup.object().shape({
			defineMetric: yup.string(),
			defineHost: yup.string(),
			selectValue: yup.string(),
			selectGroupBy: yup.string(),
		}),
	),
	formula: yup.string(),
	evaluationMethod: yup.string(),
	timeframe: yup.string(),
	conditions: yup.string(),
	thresholdValue: yup.mixed(),
	donotNotify: yup.boolean().nullable(),
	logCount: yup.string(),
	logcountthresholdValue: yup.mixed(),
	logtriggerValue: yup.mixed(),
	tags: yup.array().of(yup.string()),
});

const mockIssues = [
	{
		id: "ISSUE-1",
		title: "Fix layout bug in dashboard",
		date: "2024-02-10",
		labels: ["bug", "dashboard"],
		status: "in-progress",
		state: "Open",
	},
	{
		id: "ISSUE-2",
		title: "Add new feature for user profiles",
		date: "2024-02-12",
		labels: ["feature", "profiles"],
		status: "todo",
		state: "Open",
	},
];

export default function Alerts() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [inputValue, setInputValue] = useState("");
	const [formData, setFormData] = useState({
		alertName: "",
		alertType: "",
		metrics: [
			{
				defineMetric: "",
				defineHost: "",
				selectValue: "",
				identifier: "a",
				selectGroupBy: "",
			},
		],
		formula: "",
		evaluationMethod: "",
		timeframe: "",
		conditions: "",
		thresholdValue: "",
		donotNotify: false,
		logCount: "",
		logcountthresholdValue: "",
		logtriggerValue: "",
		tags: [],
	});

	const [alertsData, setAlertsData] = useState([]);

	const [selectedAlert, setSelectedAlert] = useState(null);
	const handleAlertClick = (alert) => {
		setSelectedAlert(alert);
		console.log("Alert clicked:", alert);
		// New log to confirm the state update
		console.log("selectedAlert after click:", selectedAlert);
	};
	const handleAlertTypeChange = (selectedOption) => {
		handleChange("alertType", selectedOption.value);
	};
	const getNextAlphabetChar = (currentIndex) => {
		const charCodeOfA = "a".charCodeAt(0);
		return String.fromCharCode(charCodeOfA + (currentIndex % 26));
	};

	const fetchAlerts = async () => {
		const { data, error } = await supabase.from("alerts-table").select("*");
		console.log("Data:", data);
		console.error("Error:", error);
		if (error) {
			console.error("Error fetching alerts:", error);
		} else {
			setAlertsData(data);
			if (data && data.length > 0) {
				setSelectedAlert(data[0]);
			}
		}
	};

	useEffect(() => {
		fetchAlerts();
	}, []);

	useEffect(() => {
		console.log("Selected alert has changed:", selectedAlert);
	}, [selectedAlert]);

	useEffect(() => {
		console.log("Updated formData:", formData);
	}, [formData]);

	const handleChange = (name, value) => {
		console.log(`handleChange: name = ${name}, value = `, value);
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleMetricChange = (index, fieldName) => (selectedOption) => {
		console.log(
			`handleMetricChange: index = ${index}, fieldName = ${fieldName}, value = `,
			selectedOption.value,
		);
		setFormData((prevFormData) => {
			const updatedMetrics = [...prevFormData.metrics];
			updatedMetrics[index][fieldName] = selectedOption.value;
			return { ...prevFormData, metrics: updatedMetrics };
		});
	};

	const handleAddMetric = () => {
		const newMetric = {
			defineMetric: "",
			defineHost: "",
			selectValue: "",
			selectGroupBy: "",
			identifier: getNextAlphabetChar(formData.metrics.length),
		};
		setFormData((prev) => ({
			...prev,
			metrics: [...prev.metrics, newMetric],
		}));
	};

	const handleRemoveMetric = (index) => {
		const updatedMetrics = formData.metrics.filter((_, i) => i !== index);
		setFormData((prev) => ({
			...prev,
			metrics: updatedMetrics,
		}));
	};

	const [tags, setTags] = useState([]);

	const handleTagInputKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			const newTag = event.target.value.trim();
			if (newTag && !formData.tags.includes(newTag)) {
				setFormData((prevFormData) => ({
					...prevFormData,
					tags: [...prevFormData.tags, newTag],
				}));
				setInputValue("");
			}
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData((prevFormData) => ({
			...prevFormData,
			tags: prevFormData.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleSubmit = async (event) => {
		if (event.preventDefault) {
			event.preventDefault();
		}
		console.log("Form Data at submission", formData);
		try {
			await schema.validate(formData, { abortEarly: false });
			const submissionData = {
				...formData,
				metrics: formData.metrics,
				thresholdValue: parseInt(formData.thresholdValue, 10),
				logcountthresholdValue: parseInt(formData.logcountthresholdValue, 10),
			};
			if (formData.alertType === "Log Alert") {
				delete submissionData.donotNotify;
			}
			const { data, error } = await supabase
				.from("alerts-table")
				.insert([submissionData]);
			console.log("Supabase response:", data, "Supabase error:", error);
			if (error) {
				console.error("Submission Error:", error);
			} else {
				console.log("Form submitted successfully:", data);
				onClose();
				setFormData({
					alertName: "",
					alertType: "",
					metrics: [
						{
							defineMetric: "",
							defineHost: "",
							selectValue: "",
							identifier: "a",
							selectGroupBy: "",
						},
					],
					formula: "",
					evaluationMethod: "",
					timeframe: "",
					conditions: "",
					thresholdValue: "",
					donotNotify: false,
					logCount: "",
					logcountthresholdValue: "",
					logtriggerValue: "",
					tags: [],
				});
				setInputValue("");
			}
		} catch (err) {
			console.error("Validation Error:", err.inner ? err.inner : err);
			if (err.inner && err.inner.length) {
				err.inner.forEach((error) => {
					console.log(error.path, error.message);
				});
			}
		}
	};

	return (
		<>
			<SplitPage breakpoint="sm">
				<Page borderRightWidth="1px" width="30%" maxW="300px" mr="0">
					<PageHeader
						id={"specialButon"}
						textAlign="start"
						gridAutoFlow="column"
						title={
							<Text fontWeight="semibold" fontSize="md" marginInlineEnd="4">
								Alert Manager
							</Text>
						}
					/>
					<PageBody contentWidth="full" maxHeight="800px" overflowY='auto' paddingTop={"5"} p={"5"}>
						<StructuredList>
							{alertsData?.map((alert, index) => (
								<StructuredListItem
									key={index}
									onClick={() => handleAlertClick(alert)}
								>
									<StructuredListCell>
										<Text>{alert.alertName}</Text>{" "}
									</StructuredListCell>
								</StructuredListItem>
							))}
						</StructuredList>
					</PageBody>
				</Page>
				<Page
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
					<PageHeader
						id={"specialButon"}
						textAlign='start'
						title={
							<Flex align="center">
								<Text fontWeight="semibold" fontSize="md" marginInlineEnd="0">
									Alert Details
								</Text>
								{/* {selectedAlert && (
									<>
										<Text mx="2">{">"}</Text>
										<Text fontWeight="semibold" fontSize="md">
											{selectedAlert.alertName}
										</Text>
									</>
								)} */}
							</Flex>
						}
					/>
					<Flex
						justifyContent="flex-end"
						pt={0}
						pr={4}
						position="absolute"
						right="3"
						top="3"
					>
						<Button
							onClick={onOpen}
							leftIcon={<FiPlusCircle />}
							variant="outline"
						>
							Create New Alert
						</Button>
					</Flex>
					<PageBody contentWidth="full" maxHeight="800px" overflowY='auto' paddingTop={"5"} p={"5"}>
						{selectedAlert && (
							<Box m={4}>
								<Box mt={6} mb={6}>
									<HStack spacing="24px">
										<OnCall />
										<NotificationOptions />
										<Personas />
									</HStack>
								</Box>
								<PropertyCard alert={selectedAlert} />
								<Box mt={8}>
									<AreaCharts />
								</Box>
								<Box mt={6}>
									<IssuesList issues={mockIssues} />
								</Box>
							</Box>
						)}
					</PageBody>
				</Page>

			</SplitPage>
			<Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>Create New Alert</DrawerHeader>

					<DrawerBody>
						<Form onSubmit={handleSubmit}>
							<>
								<FormLayout>
									<Text fontSize="md" fontWeight="regular" mt="4">
										Choose alert type
									</Text>
									<Box mb={4}>
										<Select
											name="alertType"
											options={[
												{ value: "Metric Alert", label: "Metric Alert" },
												{ value: "Log Alert", label: "Log Alert" },
											]}
											placeholder="Alert Type"
											onChange={(option) =>
												handleChange("alertType", option.value)
											}
										/>
										{formData.alertType && (
											<Box mt={4}>
												<Text fontSize="sm" colorScheme="teal">
													{formData.alertType === "Metric Alert" &&
														"An alert is triggered whenever a metric crosses a threshold value."}
													{formData.alertType === "Log Alert" &&
														"An alert is triggered whenever a specified type of log exceeds a threshold value."}
												</Text>
											</Box>
										)}
									</Box>
								</FormLayout>
								<DisplayIf
									condition={() => formData.alertType === "Metric Alert"}
								>
									<FormLayout mb={4}>
										<Text fontSize="md" fontWeight="regular">
											Give a name for your alert
										</Text>
										<Field
											type="text"
											name="alertName"
											value={formData.alertName}
											onChange={(e) =>
												handleChange("alertName", e.target.value)
											}
										/>
									</FormLayout>
									<VStack spacing={4} align="flex-start">
										<Text fontSize="md" fontWeight="regular">
											Define the metric(s)
										</Text>
										{formData.metrics.map((metric, index) => (
											<Flex key={index} align="center" justify="space-between">
												<Box position="relative" mr={4}>
													<Tag size="lg" variant="solid" colorScheme="gray">
														{metric.identifier}
													</Tag>
												</Box>
												<FormLayout
													templateColumns="repeat(4, 1fr)"
													gap={2}
													w="full"
												>
													<Select
														name={`metrics[${index}].defineMetric`}
														options={[
															{
																value: "IncomingBytes",
																label: "IncomingBytes",
															},
															{ value: "CallCount", label: "CallCount" },
														]}
														placeholder="metric"
														size="md"
														colorScheme="gray"
														value={
															formData.metrics[index].defineMetric
																? {
																	value: formData.metrics[index].defineMetric,
																	label: formData.metrics[index].defineMetric,
																}
																: null
														}
														onChange={handleMetricChange(index, "defineMetric")}
													/>
													<Select
														name={`metrics[${index}].defineHost`}
														options={[
															{ value: "everywhere", label: "everywhere" },
															{
																value: "host-i-0901c193bd610946a",
																label: "host-i-0901c193bd610946a",
															},
															{
																value: "host-i-0901c193bd610946b",
																label: "host-i-0901c193bd610946b",
															},
														]}
														placeholder="from"
														size="md"
														colorScheme="gray"
														value={
															formData.metrics[index].defineHost
																? {
																	value: formData.metrics[index].defineHost,
																	label: formData.metrics[index].defineHost,
																}
																: null
														}
														onChange={handleMetricChange(index, "defineHost")}
													/>

													<Select
														name={`metrics[${index}].selectValue`}
														options={[
															{ value: "avg by", label: "avg by" },
															{ value: "max by", label: "max by" },
															{ value: "min by", label: "min by" },
															{ value: "sum by", label: "sum by" },
														]}
														placeholder="avg by"
														size="md"
														colorScheme="gray"
														value={
															formData.metrics[index].selectValue
																? {
																	value: formData.metrics[index].selectValue,
																	label: formData.metrics[index].selectValue,
																}
																: null
														}
														onChange={handleMetricChange(index, "selectValue")}
													/>

													<Select
														name={`metrics[${index}].selectGroupBy`}
														options={[
															{ value: "everything", label: "everything" },
															{ value: "host", label: "host" },
															{ value: "host ip", label: "host ip" },
														]}
														placeholder="everything"
														size="md"
														colorScheme="gray"
														value={
															formData.metrics[index].selectGroupBy
																? {
																	value:
																		formData.metrics[index].selectGroupBy,
																	label:
																		formData.metrics[index].selectGroupBy,
																}
																: null
														}
														onChange={handleMetricChange(
															index,
															"selectGroupBy",
														)}
													/>
												</FormLayout>
												<HStack spacing={2} ml={2}>
													{formData.metrics.length > 1 && (
														<IconButton
															aria-label="Remove Metric"
															icon={<FiMinusCircle />}
															colorScheme="gray"
															onClick={() => handleRemoveMetric(index)}
															size="sm"
															variant="solid"
														/>
													)}
													{index === formData.metrics.length - 1 && (
														<IconButton
															aria-label="Add Metric"
															icon={<FiPlusCircle />}
															colorScheme="gray"
															onClick={handleAddMetric}
															size="sm"
															variant="solid"
														/>
													)}
												</HStack>
											</Flex>
										))}
									</VStack>

									<Box mb={4} mt={4}>
										<Text fontSize="md" fontWeight="regular" mb={4} mt={4}>
											Aggregate metrics by formula
										</Text>
										<Field
											type="text"
											name="formula"
											placeholder="e.g., a + b or 2*a"
											value={formData.formula}
											onChange={(e) => handleChange("formula", e.target.value)}
										/>
									</Box>

									<VStack spacing={4} align="stretch" mb={4}>
										<HStack
											width="full"
											justify="space-between"
											flexWrap="wrap"
										>
											<Box flexShrink={0} mr={2}>
												<Text fontSize="md" fontWeight="regular">
													Evaluate the
												</Text>
											</Box>
											<Box flex="1" minW="120px" maxW="calc(50% - 16px)" mb={2}>
												<Select
													name="evaluationMethod"
													options={[
														{ value: "average", label: "average" },
														{ value: "minimum", label: "minimum" },
														{ value: "maximum", label: "maximum" },
														{ value: "sum", label: "sum" },
													]}
													placeholder="average"
													size="md"
													colorScheme="gray"
													value={
														formData.evaluationMethod
															? {
																value: formData.evaluationMethod,
																label: formData.evaluationMethod,
															}
															: null
													}
													onChange={({ value }) =>
														handleChange("evaluationMethod", value)
													}
												/>
											</Box>
											<Box flexShrink={0} mr={2}>
												<Text fontSize="md" fontWeight="regular">
													of the query over the
												</Text>
											</Box>
											<Box flex="1" minW="120px" maxW="calc(50% - 16px)">
												<Select
													name="timeframe"
													options={[
														{
															value: "Last 5 minutes",
															label: "Last 5 minutes",
														},
														{
															value: "Last 15 minutes",
															label: "Last 15 minutes",
														},
														{
															value: "Last 30 minutes",
															label: "Last 30 minutes",
														},
														{ value: "Last 1 hour", label: "Last 1 hour" },
														{ value: "Last 2 hours", label: "Last 2 hours" },
														{ value: "Last 4 hours", label: "Last 4 hours" },
														{ value: "Last 1 day", label: "Last 1 day" },
														{ value: "Last 2 days", label: "Last 2 days" },
														{ value: "Last 1 week", label: "Last 1 week" },
														{ value: "Last 1 month", label: "Last 1 month" },
													]}
													placeholder="last 5 minutes"
													size="md"
													colorScheme="gray"
													value={
														formData.timeframe
															? {
																value: formData.timeframe,
																label: formData.timeframe,
															}
															: null
													}
													onChange={({ value }) =>
														handleChange("timeframe", value)
													}
												/>
											</Box>
										</HStack>
									</VStack>

									<VStack spacing={4} align="stretch" mb={4}>
										<Flex
											width="full"
											direction={{ base: "column", sm: "row" }}
											wrap="wrap"
										>
											<Box flex="1" pr={2} mb={2}>
												<Text fontSize="md" fontWeight="regular" mb={2}>
													Trigger when the metric value is:
												</Text>
												<Select
													name="conditions"
													options={[
														{
															value: "above the threshold",
															label: "above the threshold",
														},
														{
															value: "above or equal to the threshold",
															label: "above or equal to the threshold",
														},
														{
															value: "below the threshold",
															label: "below the threshold",
														},
														{
															value: "below or equal to the threshold",
															label: "below or equal to the threshold",
														},
													]}
													placeholder="Select condition"
													size="md"
													colorScheme="gray"
													value={
														formData.conditions
															? {
																value: formData.conditions,
																label: formData.conditions,
															}
															: null
													}
													onChange={({ value }) =>
														handleChange("conditions", value)
													}
												/>
											</Box>
											<Box flex="1" pl={{ sm: 2 }}>
												<Text fontSize="md" fontWeight="regular" mb={2}>
													And that threshold value is:
												</Text>
												<Field
													name="thresholdValue"
													placeholder="Threshold value"
													size="md"
													type="number"
													value={formData.thresholdValue || ""}
													onChange={(value) =>
														handleChange(
															"thresholdValue",
															value === "" ? undefined : Number(value),
														)
													}
												/>
											</Box>
										</Flex>
									</VStack>

									<Box mb={4}>
										<Flex alignItems="center" justifyContent="space-between">
											<Box flex="1">
												<Field
													name="donotNotify"
													label={
														<Flex alignItems="center">
															Do not notify if data is missing
															<Tooltip
																label="Enable missing data notifications for metrics that should report constantly. Disable them for something like auto-scaling group of hosts that may come and go."
																fontSize="sm"
																placement="right"
																ml={1}
															>
																<span>
																	<FiInfo
																		size="16"
																		color="gray.500"
																		style={{
																			cursor: "pointer",
																			marginLeft: "8px",
																		}}
																	/>
																</span>
															</Tooltip>
														</Flex>
													}
													type="checkbox"
													onChange={(e) =>
														handleChange("donotNotify", e.target.checked)
													}
													checked={formData.donotNotify}
												/>
											</Box>
										</Flex>
									</Box>
								</DisplayIf>
								<DisplayIf condition={() => formData.alertType === "Log Alert"}>
									<FormLayout mb={4}>
										<Text fontSize="md" fontWeight="regular">
											Give a name for your alert
										</Text>
										<Field
											type="text"
											name="alertName"
											value={formData.alertName}
											onChange={(e) =>
												handleChange("alertName", e.target.value)
											}
										/>
									</FormLayout>
									<VStack spacing={4} align="stretch" mb={4}>
										<Flex
											width="full"
											direction={{ base: "column", sm: "row" }}
											wrap="wrap"
										>
											<FormLayout
												templateColumns="repeat(3, 1fr)"
												gap={2}
												w="full"
											>
												<Box flex="1" pr={2} mb={2}>
													<Text fontSize="md" fontWeight="regular" mb={2}>
														Monitor log count over the
													</Text>
													<Select
														name="logCount"
														options={[
															{
																value: "Last 5 minutes",
																label: "Last 5 minutes",
															},
															{
																value: "Last 15 minutes",
																label: "Last 15 minutes",
															},
															{
																value: "Last 30 minutes",
																label: "Last 30 minutes",
															},
															{ value: "Last 1 hour", label: "Last 1 hour" },
															{
																value: "Last 2 hours",
																label: "Last 2 hours",
															},
															{
																value: "Last 4 hours",
																label: "Last 4 hours",
															},
															{ value: "Last 1 day", label: "Last 1 day" },
															{ value: "Last 2 days", label: "Last 2 days" },
															{ value: "Last 1 week", label: "Last 1 week" },
															{
																value: "Last 1 month",
																label: "Last 1 month",
															},
														]}
														placeholder="last 5 minutes"
														size="md"
														colorScheme="gray"
														value={
															formData.logCount
																? {
																	value: formData.logCount,
																	label: formData.logCount,
																}
																: null
														}
														onChange={({ value }) =>
															handleChange("logCount", value)
														}
													/>
												</Box>
												<Box flex="1" pr={2} mb={2}>
													<Text fontSize="md" fontWeight="regular" mb={2}>
														Trigger when the value is:
													</Text>
													<Select
														name="logtriggerValue"
														options={[
															{
																value: "above the threshold",
																label: "above the threshold",
															},
															{
																value: "above or equal to the threshold",
																label: "above or equal to the threshold",
															},
															{
																value: "below the threshold",
																label: "below the threshold",
															},
															{
																value: "below or equal to the threshold",
																label: "below or equal to the threshold",
															},
														]}
														placeholder="above"
														size="md"
														colorScheme="gray"
														value={
															formData.logtriggerValue
																? {
																	value: formData.logtriggerValue,
																	label: formData.logtriggerValue,
																}
																: null
														}
														onChange={({ value }) =>
															handleChange("logtriggerValue", value)
														}
													/>
												</Box>
												<Box flex="1" pr={2} mb={2}>
													<Text fontSize="md" fontWeight="regular" mb={2}>
														And that value is:
													</Text>
													<Field
														name="logcountthresholdValue"
														placeholder="Enter value"
														size="md"
														type="number"
														value={formData.logcountthresholdValue || ""}
														onChange={(value) =>
															handleChange(
																"logcountthresholdValue",
																value === "" ? undefined : Number(value),
															)
														}
													/>
												</Box>
											</FormLayout>
										</Flex>
									</VStack>
									<FormLayout mb={4} mt={4}>
										<Text fontSize="md" fontWeight="regular" mb={2}>
											Add an attribute to the query (optional)
										</Text>
										<Input
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyDown={handleTagInputKeyDown}
											placeholder="Type attribute name and press enter"
										/>
										<HStack spacing={4}>
											{formData.tags.map((tag, index) => (
												<Tag
													size="md"
													key={index}
													borderRadius="full"
													variant="outline"
													colorScheme="gray"
												>
													<TagLabel>{tag}</TagLabel>
													<TagCloseButton onClick={() => removeTag(tag)} />
												</Tag>
											))}
										</HStack>
									</FormLayout>
								</DisplayIf>
								<SubmitButton>Create Alert</SubmitButton>
							</>
						</Form>
					</DrawerBody>
				</DrawerContent>
			</Drawer>

		</>
	);
}
