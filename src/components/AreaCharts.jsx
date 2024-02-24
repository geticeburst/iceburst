import { Card, CardBody, CardHeader, Heading } from '@chakra-ui/react'
import { AreaChart } from '@saas-ui/charts'

export default function AreaCharts() {
  return (
    <Card>
      <CardHeader pb="0">
        <Heading as="h4" fontWeight="regular" size="sm">
          Notifications Overview
        </Heading>
      </CardHeader>
      <CardBody>
        <AreaChart
          data={data}
          categories={['Alert', 'Warn', 'OK']}
          height="300px"
        />
      </CardBody>
    </Card>
  )
}

const data = [
  {
    date: 'Dec 1',
    Alert: 40,
    Warn: 21,
    OK: 10,
  },
  {
    date: 'Dec 2',
    Alert: 38,
    Warn: 22,
    OK: 12,
  },
  {
    date: 'Dec 3',
    Alert: 49,
    Warn: 22,
    OK: 16,
  },
  {
    date: 'Dec 4',
    Alert: 48,
    Warn: 29,
    OK: 20,
  },
  {
    date: 'Dec 5',
    Alert: 50,
    Warn: 22,
    OK: 22,
  },
  {
    date: 'Dec 6',
    Alert: 42,
    Warn: 30,
    OK: 24,
  },
  {
    date: 'Dec 7',
    Alert: 41,
    Warn: 28,
    OK: 26,
  },
  {
    date: 'Dec 8',
    Alert: 44,
    Warn: 23,
    OK: 28,
  },
  {
    date: 'Dec 9',
    Alert: 44,
    Warn: 24,
    OK: 30,
  },
  {
    date: 'Dec 10',
    Alert: 44,
    Warn: 30,
    OK: 40,
  },
  {
    date: 'Dec 11',
    Alert: 46,
    Warn: 25,
    OK: 44,
  },
  {
    date: 'Dec 12',
    Alert: 48,
    Warn: 25,
    OK: 48,
  },
  {
    date: 'Dec 13',
    Alert: 46,
    Warn: 25,
    OK: 50,
  },
  {
    date: 'Dec 14',
    Alert: 50,
    Warn: 28,
    OK: 52,
  },
  {
    date: 'Dec 15',
    Alert: 42,
    Warn: 34,
    OK: 56,
  },
  {
    date: 'Dec 16',
    Alert: 58,
    Warn: 33,
    OK: 10,
  },
  {
    date: 'Dec 17',
    Alert: 49,
    Warn: 35,
    OK: 10,
  },
  {
    date: 'Dec 18',
    Alert: 44,
    Warn: 33,
    OK: 10,
  },
  {
    date: 'Dec 19',
    Alert: 46,
    Warn: 35,
    OK: 10,
  },
  {
    date: 'Dec 20',
    Alert: 44,
    Warn: 35,
    OK: 10,
  },
  {
    date: 'Dec 21',
    Alert: 51,
    Warn: 30,
    OK: 10,
  },
  {
    date: 'Dec 22',
    Alert: 58,
    Warn: 36,
    OK: 10,
  },
  {
    date: 'Dec 23',
    Alert: 46,
    Warn: 30,
    OK: 10,
  },
  {
    date: 'Dec 24',
    Alert: 61,
    Warn: 30,
    OK: 10,
  },
  {
    date: 'Dec 25',
    Alert: 56,
    Warn: 33,
    OK: 10,
  },
  {
    date: 'Dec 26',
    Alert: 55,
    Warn: 33,
    OK: 10,
  },
  {
    date: 'Dec 27',
    Alert: 47,
    Warn: 32,
    OK: 10,
  },
  {
    date: 'Dec 28',
    Alert: 55,
    Warn: 33,
    OK: 10,
  },
  {
    date: 'Dec 29',
    Alert: 61,
    Warn: 32,
    OK: 10,
  },
  {
    date: 'Dec 30',
    Alert: 62,
    Warn: 29,
    OK: 10,
  },
  {
    date: 'Dec 31',
    Alert: 52,
    Warn: 37,
    OK: 10,
  },
]