
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ColorModeScript } from '@chakra-ui/react'
// 1. Import the extendTheme function
import { extendTheme } from '@chakra-ui/react'
;

// 2. Import the Saas UI theme
import { SaasProvider, ModalsProvider, theme as baseTheme } from '@saas-ui/react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()
// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ colors, config }, baseTheme)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SaasProvider theme={theme}>

      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ModalsProvider>
    </SaasProvider>
  </React.StrictMode>,
)