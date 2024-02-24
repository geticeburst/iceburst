import React, { useEffect, useState, useMemo } from "react";
import ReactFlow, {
	Controls,
	useNodesState,
	useEdgesState,
	ReactFlowProvider,
	Background,
} from "reactflow";
import "reactflow/dist/style.css";
import "./components/index.css";
import TurboNode from "./components/TurboNode";
import TurboEdge from "./components/TurboEdge";
import { Box, Text, Flex } from "@chakra-ui/react";
import {
	AppShell,
	EmptyState,
	StructuredList,
	StructuredListItem,
	StructuredListCell,
	SearchInput,
} from "@saas-ui/react";
import {
	SplitPage,
	Page,
	PageHeader,
	PageBody,
	Toolbar,
} from "@saas-ui-pro/react";
import tracesData from "./data/traces.json";

const stickyStyles = {
	position: 'sticky',
	zIndex: 1,
	bg: 'chakra-body-bg',
	textTransform: 'capitalize',
	borderWidth: 0,
}

const xOffset = 100;
const generatePosition = (index) => ({ x: index * 350 + xOffset, y: 250 });
const defaultEdgeOptions = {
	type: "turbo",
	markerEnd: "edge-circle",
};

const keyStyle = { fontWeight: "bold", color: "#C0CBB8" };
const valueStyle = { color: "#878787" };

export default function Traces() {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [selectedTraceName, setSelectedTraceName] = useState("");
	const [uniqueNames, setUniqueNames] = useState([]);
	const [selectedNode, setSelectedNode] = useState(null);
	const nodeTypes = useMemo(() => ({ turbo: TurboNode }), []);
	const edgeTypes = useMemo(() => ({ turbo: TurboEdge }), []);

	const onNodeClick = (event, node) => {
		console.log("Node clicked:", node);
		setSelectedNode(node);
	};

	useEffect(() => {
		const operationNames = tracesData.data.flatMap((trace) =>
			trace.spans.map((span) => span.operationName),
		);
		setUniqueNames([...new Set(operationNames)]);
	}, []);

	useEffect(() => {
		if (selectedTraceName) {
			const selectedTraces = tracesData.data.filter((trace) =>
				trace.spans.some((span) => span.operationName === selectedTraceName),
			);
			if (selectedTraces.length > 0) {
				const { nodes, edges } = convertTraceToElements(selectedTraces[0]);
				setNodes(nodes);
				setEdges(edges);
			}
		}
	}, [selectedTraceName]);

	const convertTraceToElements = (trace) => {
		let nodes = [],
			edges = [];
		trace.spans.forEach((span, index) => {
			nodes.push({
				id: span.spanID,
				position: generatePosition(index),
				data: {
					title: span.operationName,
					subline: `Span ID: ${span.spanID}`,
					details: span,
				},
				type: "turbo",
				onClick: () => setSelectedNode(span),
			});
			span.references?.forEach((ref) => {
				edges.push({
					id: `e${ref.spanID}-${span.spanID}`,
					source: ref.spanID,
					target: span.spanID,
					type: "turbo",
				});
			});
		});
		return { nodes, edges };
	};

	const renderValue = (value) => {
		if (Array.isArray(value)) {
			return <Text style={valueStyle}>[Array]</Text>;
		} else if (typeof value === "string") {
			return <Text style={valueStyle}>'{value}'</Text>;
		} else if (typeof value === "number") {
			return <Text style={valueStyle}>{value}</Text>;
		} else if (typeof value === "boolean") {
			return <Text style={valueStyle}>{value ? "true" : "false"}</Text>;
		} else if (value === null) {
			return <Text style={valueStyle}>null</Text>;
		} else {
			return <Text style={valueStyle}>[Object]</Text>;
		}
	};

	const renderDetail = (key, value, level = 0) => {
		const paddingLeft = `${level * 8}px`;
		if (Array.isArray(value) && value.length === 0) {
			return null;
		}
		if (key === "tags" && Array.isArray(value)) {
			return (
				<Box mb={4}>
					{value.map((tag, index) => (
						<Text as="div" key={tag.key || index} pl={paddingLeft}>
							<Text as="span" style={keyStyle}>{`${tag.key}: `}</Text>
							{renderValue(tag.value)}
						</Text>
					))}
				</Box>
			);
		} else if (typeof value === "object" && value !== null) {
			return (
				<Box mb={4}>
					{Object.entries(value).map(([nestedKey, nestedValue], index) => (
						<Box key={`detail-${nestedKey}-${level}-${index}`} pl={paddingLeft}>
							{renderDetail(nestedKey, nestedValue, level + 1)}
						</Box>
					))}
				</Box>
			);
		} else {
			return (
				<Flex wrap="wrap" mb={4}>
					<Text as="span" style={keyStyle} mr={2}>
						{key}:
					</Text>
					{renderValue(value)}
				</Flex>
			);
		}
	};

	const renderSpanDetails = () => {
		console.log("Rendering span details for node:", selectedNode);
		if (!selectedNode || !selectedNode.data || !selectedNode.data.details) {
			return (
				<Box p="4">
					Select a node to see details or the selected node has no details
					available.
				</Box>
			);
		}

		const details = selectedNode.data.details;

		const renderDetailsRecursively = (detailObject, level = 0) => {
			return Object.entries(detailObject).reduce((acc, [key, value]) => {
				if (Array.isArray(value) && value.length === 0) {
					return acc;
				}

				const detailElement = renderDetail(key, value, level);
				if (detailElement) {
					acc.push(detailElement);
				}
				return acc;
			}, []);
		};

		const renderedDetails = renderDetailsRecursively(details);

		return (
			<Flex
				direction="column"
				overflowY="auto"
				p="4"
				fontSize="sm"
				maxWidth="280px"
				w="100%"
			>
				{renderedDetails}
			</Flex>
		);
	};

	return (

		<SplitPage breakpoint="sm">
			<Page 
			
			borderRightWidth="1px" width="25%" maxW="500px" mr="0">
				<PageHeader
					id={"specialButon"}
					title={
						<Text fontWeight="semibold" fontSize="md" marginInlineEnd="4">
							Traces
						</Text>
					}
				/>
				<PageBody p="0"  maxHeight="800px" overflowY='auto' paddingTop={"5"} >
					{uniqueNames.length > 0 ? (
						<StructuredList>
							{uniqueNames.map((name, index) => (
								<StructuredListItem
									key={index}
									onClick={() => setSelectedTraceName(name)}
								>
									<StructuredListCell>{name}</StructuredListCell>
								</StructuredListItem>
							))}
						</StructuredList>
					) : (
						<EmptyState title="No Traces Found" />
					)}
				</PageBody>
			</Page>
			<Page
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
					textAlign="start"
					toolbar={
						<Toolbar>
							<Flex align="center" justify="space-between" width="full">
								<Flex ml={2}>
									<Box>
										<SearchInput
											size="sm"
											width={{
												base: "full",
												lg: 750,
											}}
											onChange={(e) => {
												
											}}
											onReset={() => {
												
											}}
										/>
									</Box>
								</Flex>
							</Flex>
						</Toolbar>
					}
				/>
				<PageBody contentWidth="full" maxHeight="800px" overflowY='auto' paddingTop={"5"} p={"5"}>
					<Flex direction="row" height="100vh">
						<Flex>
							<ReactFlowProvider>
								<div style={{ width: "55vw", height: "100vh" }}>
									<ReactFlow
										nodes={nodes}
										edges={edges}
										onNodesChange={onNodesChange}
										onEdgesChange={onEdgesChange}
										nodeTypes={nodeTypes}
										edgeTypes={edgeTypes}
										defaultEdgeOptions={defaultEdgeOptions}
										onNodeClick={onNodeClick}
									>
										<Controls />
										<svg>
											<defs>
												<linearGradient id="edge-gradient">
													<stop offset="0%" stopColor="#ae53ba" />
													<stop offset="100%" stopColor="#2a8af6" />
												</linearGradient>

												<marker
													id="edge-circle"
													viewBox="-5 -5 10 10"
													refX="0"
													refY="0"
													markerUnits="strokeWidth"
													markerWidth="10"
													markerHeight="10"
													orient="auto"
												>
													<circle
														stroke="#2a8af6"
														strokeOpacity="0.75"
														r="2"
														cx="0"
														cy="0"
													/>
												</marker>
											</defs>
										</svg>
										<Background variant="dots" gap={12} size={1} />
									</ReactFlow>
								</div>
							</ReactFlowProvider>
						</Flex>
						<Flex flex="1" minW="0" p="4" borderLeftWidth="1px">
							{selectedNode && renderSpanDetails()}
							{!selectedNode && (
								<Box p="4">Select a node to see details.</Box>
							)}
						</Flex>
					</Flex>
				</PageBody>
			</Page>
		</SplitPage>

	);
}
