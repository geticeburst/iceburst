import {
  StructuredList,
  StructuredListHeader,
  StructuredListItem,
  StructuredListIcon,
  StructuredListButton,
  StructuredListCell,
} from '@saas-ui/react'
import { Avatar, Text, Tag, Card } from '@chakra-ui/react'

export default function OnCall() {
  return (
    <Card width="320px">
      <StructuredList>
        <StructuredListHeader>Today's Oncall</StructuredListHeader>
        <StructuredListItem>
          <StructuredListCell width="14">
            <Avatar name="Elliot Alderson" size="sm" />
          </StructuredListCell>
          <StructuredListCell flex="1">
            <Text fontWeight="bold">Elliot Alderson</Text>
            <Text fontSize="sm" color="muted">
              elliot@acme.com
            </Text>
          </StructuredListCell>
          <StructuredListCell>
            <Tag>admin</Tag>
          </StructuredListCell>
        </StructuredListItem>
        <StructuredListItem>
          <StructuredListCell width="14">
            <Avatar name="Tyrell Wellick" size="sm" />
          </StructuredListCell>
          <StructuredListCell flex="1">
            <Text fontWeight="bold">Tyrell Wellick</Text>
            <Text fontSize="sm" color="muted">
              tyrell@acme.com
            </Text>
          </StructuredListCell>
          <StructuredListCell>
            <Tag>owner</Tag>
          </StructuredListCell>
        </StructuredListItem>
      </StructuredList>
    </Card>
  )
}