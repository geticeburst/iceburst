import React from 'react';
import {
  Text,
  Tag,
  Card,
  HStack,
  Checkbox,
  Highlight,
} from '@chakra-ui/react';
import {
  StructuredList,
  StructuredListHeader,
  StructuredListItem,
  StructuredListCell,
  Select,
  SelectButton,
  SelectList,
  SelectOption,
} from '@saas-ui/react';

const IssuesList = ({ issues }) => {
  
  const renderIssue = (issue) => {
    return (
      <StructuredListItem 
        key={issue.id} 
        as={HStack} 
        spacing="4" 
        borderBottom="1px" 
        borderColor="gray.100"
        _dark={{
          borderColor: 'whiteAlpha.100',
        }}
        >
        <StructuredListCell width="4" role="group">
          <Checkbox
            opacity="0"
            _checked={{ opacity: 1 }}
            _groupHover={{ opacity: 1 }}
            size="md"
            rounded="sm"
          />
        </StructuredListCell>
        <StructuredListCell color="muted">{issue.id}</StructuredListCell>
        <StructuredListCell flex="1">
          <Text>{issue.title}</Text>
        </StructuredListCell>
        <StructuredListCell color="muted" as={HStack} spacing="2">
          {issue.labels.map((label) => (
            <Tag 
            key={label} 
            bg="none" 
            border="1px solid" 
            borderColor="blackAlpha.100" 
            color="muted" 
            rounded="full"
            _dark={{
              borderColor: 'whiteAlpha.100',
            }}
            >
              {label}
            </Tag>
          ))}
        </StructuredListCell>
        <StructuredListCell color="muted">{issue.date}</StructuredListCell>
        <StructuredListCell>
          <Select defaultValue={issue.status}>
            <SelectButton size="sm" />
            <SelectList>
              <SelectOption value="open">Open</SelectOption>
              <SelectOption value="closed">Closed</SelectOption>
              <SelectOption value="triage">Triage</SelectOption>
              <SelectOption value="mute">Mute</SelectOption>
            </SelectList>
          </Select>
        </StructuredListCell>
      </StructuredListItem>
    );
  };

  return (
    <Card width="100%" overflowY="auto" maxH="240px">
      <StructuredList py="0">
        <StructuredListHeader 
          fontWeight="normal" 
          bg="gray.200" 
          color="app-text" 
          position="sticky" 
          top="0" 
          zIndex="popover"
          _dark={{ bg: 'gray.700' }}
          >
          Issues {' '} <Highlight
    query={issues.length.toString()}
    styles={{ px: '1', py: '0.8', rounded: 'full', bg: 'gray.200' }}
  >
    {issues.length.toString()}
  </Highlight>
        </StructuredListHeader>
        {issues.map(renderIssue)}
      </StructuredList>
    </Card>
  );
};

export default IssuesList;
