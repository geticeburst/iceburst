import {
  Box,
  Spacer,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Flex,
  Container,
  Text,
  background
} from '@chakra-ui/react'
import {
  AppShell,
  Sidebar,
  SidebarToggleButton,
  SidebarSection,
  NavItem,
  PersonaAvatar,
  SearchInput,
} from '@saas-ui/react'
import { FiHome, FiUsers, FiSettings, FiX, FiSearch } from 'react-icons/fi'
import {
  Page, PageHeader, PageBody, DataGrid,
  DataGridPagination, Toolbar,
  ToolbarButton,
} from '@saas-ui-pro/react'

import './Mod.css';
import Main from './components/layout/Main';



export default function App() {


  const toolbar = (
    <Toolbar size="sm">
      <SearchInput
        size={"50px"}
        icon={<FiSearch />}
        resetIcon={<FiX size="1.6em" />}

      />
      {/* {primaryAction} */}
    </Toolbar>
  )


  return (

    <Flex minH="100vh" align="center" justify="center" >
      <Container>
        <AppShell
          sidebar={
            <Sidebar >
              <SidebarToggleButton />
              <SidebarSection direction="row">
                <Image
                  src="https://saas-ui.dev/favicons/favicon-96x96.png"
                  boxSize="7"
                />
                <Spacer />
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={
                      <PersonaAvatar
                        presence="online"
                        size="xs"
                        src="/showcase-avatar.jpg"
                      />
                    }
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem>Sign out</MenuItem>
                  </MenuList>
                </Menu>
              </SidebarSection>
              <SidebarSection aria-label="Main">
                <NavItem icon={<FiHome />} isActive>
                  Home
                </NavItem>
                <NavItem icon={<FiUsers />}>Users</NavItem>
                <NavItem icon={<FiSettings />}>Settings</NavItem>
              </SidebarSection>
            </Sidebar>


          }
        >

          <Page >
            {/* <Spacer /> */}
            <PageHeader
              // description="moto"

              p="5"
              id={"specialButons"}
              borderBottom='1px solid red'
              textAlign='start'
              gridAutoFlow='column'
              itemRef='ssss'


            >

            </PageHeader>
            <PageBody contentWidth="full" >
              <DataGrid
                isHoverable
                isSelectable
                isSortable
                columns={[
                  { id: 'name', header: 'Name' },
                  { id: 'role', header: 'Role' },
                  {
                    id: 'actions',
                    header: '',
                    width: 10,
                    cell: () => (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    ),
                  },
                ]}
                data={[{ name: 'Renata Alink', role: 'Founder' }]}
              >
                <DataGridPagination />
              </DataGrid>
            </PageBody>
          </Page>
        </AppShell>
      </Container>
    </Flex>

  )
}