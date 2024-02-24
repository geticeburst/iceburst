import React from "react";
import {
	Card,
	CardHeader,
	CardBody,
	Code,
	Heading,
	Spacer,
	Switch,
	Grid,
	Editable,
	EditablePreview,
	EditableInput,
	GridItem,
} from "@chakra-ui/react";
import {
	Property,
} from "@saas-ui/react";

import PropTypes from "prop-types";

const PropertyCard = ({ alert }) => {

	return (
		<Card>
			<CardHeader display="flex" flexDirection="row">
				<Heading size="md">{alert.alertName}</Heading>
				<Spacer />
				<Switch id='alert-status' isChecked colorScheme="green"/>
			</CardHeader>
			<CardBody fontSize="md">
				<Grid templateColumns="repeat(2, 1fr)" gap={4}>
					<GridItem colSpan={2}>
						<Property label="Query">
							<Code w="full" p={4} colorScheme="gray.400" borderRadius="md">
								{JSON.stringify(alert.metrics, null, 2)}
							</Code>
						</Property>
					</GridItem>
					<GridItem>
						<Property label="Alert ID" value={alert.id} />
					</GridItem>
					<GridItem>
						<Property
							label="Created at"
							value={new Date(alert.created_at).toLocaleString()}
						/>
					</GridItem>
					<GridItem>
						<Property label="Type" value={alert.alertType} />
					</GridItem>
					<GridItem>
						<Property label="Formula" value={alert.formula || "N/A"} />
					</GridItem>
					{alert.alertType === "Metric Alert" && (
						<>
							<GridItem>
								<Property
									label="Evaluation Method"
									value={alert.evaluationMethod || "N/A"}
								/>
							</GridItem>
							<GridItem>
								<Property label="Timeframe" value={alert.timeframe || "N/A"} />
							</GridItem>
							<GridItem>
								<Property
									label="Conditions"
									value={alert.conditions || "N/A"}
								/>
							</GridItem>
							<GridItem>
								<Property
									label="Threshold Value"
									value={
										alert.thresholdValue !== undefined
											? alert.thresholdValue
											: "N/A"
									}
								/>
							</GridItem>
							<GridItem>
								<Property
									label="Do not Notify"
									value={
										alert.donotNotify !== undefined
											? alert.donotNotify.toString()
											: "N/A"
									}
								/>
							</GridItem>
						</>
					)}
					{alert.alertType === "Log Alert" && (
						<>
							<GridItem>
								<Property label="Log Count" value={alert.logCount || "N/A"} />
							</GridItem>
							<GridItem>
								<Property
									label="Log Trigger Value"
									value={alert.logtriggerValue || "N/A"}
								/>
							</GridItem>
							<GridItem>
								<Property
									label="Log Count Threshold Value"
									value={
										alert.logcountthresholdValue !== undefined
											? alert.logcountthresholdValue
											: "N/A"
									}
								/>
							</GridItem>
							<GridItem>
								<Property
									label="Tags"
									value={alert.tags ? alert.tags.join(", ") : "N/A"}
								/>
							</GridItem>
						</>
					)}
				</Grid>
			</CardBody>
		</Card>
	);
};

PropertyCard.propTypes = {
	alert: PropTypes.object.isRequired,
};

export default PropertyCard;
