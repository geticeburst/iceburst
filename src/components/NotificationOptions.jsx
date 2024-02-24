import {
  StructuredList,
  StructuredListHeader,
  StructuredListItem,
  StructuredListIcon,
  StructuredListCell,
} from '@saas-ui/react'
import {
  Switch,
  Card,
} from '@chakra-ui/react';
import { FiMail, FiMessageSquare, FiSlack } from "react-icons/fi";


export default function NotificationOptions() {
  return (
    <Card width="320px">
      <StructuredList>
        <StructuredListHeader>Notification Channels</StructuredListHeader>
        <StructuredListItem>
          <StructuredListIcon as={FiMail} size="4" />
          <StructuredListCell flex="1">Email</StructuredListCell>
          <StructuredListCell>
            <Switch aria-label="Email" isChecked />
          </StructuredListCell>
        </StructuredListItem>
        <StructuredListItem>
          <StructuredListIcon as={FiMessageSquare} size="4" />
          <StructuredListCell flex="1">SMS</StructuredListCell>
          <StructuredListCell>
            <Switch aria-label="sms"/>
          </StructuredListCell>
        </StructuredListItem>
        <StructuredListItem>
          <StructuredListIcon as={FiSlack} size="4" />
          <StructuredListCell flex="1">Slack</StructuredListCell>
          <StructuredListCell>
            <Switch aria-label="slack" isChecked/>
          </StructuredListCell>
        </StructuredListItem>
      </StructuredList>
    </Card>
  )
}