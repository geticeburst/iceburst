import { Stack, SimpleGrid, Button, Spacer } from '@chakra-ui/react'
import { Persona } from '@saas-ui/react'
import { Card, CardHeader, CardBody, Heading } from '@chakra-ui/react'
import { FiPlusCircle } from 'react-icons/fi'

export default function Personas() {
  return (
    <Card>
      <CardHeader display="flex" flexDirection="row">
        <Heading size="sm" color="gray.400">Subscribers to this alert</Heading>
        <Spacer />
        <Button leftIcon={<FiPlusCircle />} colorScheme='gray' size="xs" variant='solid'>Add subscriber</Button>
      </CardHeader>
      <CardBody>
    <Stack>
      <SimpleGrid columns={2} spacing={2}>
        <Persona name="Steven Soderbergh" presence="online" size="xs" />
        <Persona name="Martin Scorsese" presence="online" size="xs" />
        <Persona name="Steven Spielberg" presence="online" size="xs" />
        <Persona name="Quentin Tarantino" presence="online" size="xs" />
        <Persona name="Francis Ford Coppola" presence="online" size="xs" />
      </SimpleGrid>
     </Stack>
     </CardBody>
     </Card>
  )
}