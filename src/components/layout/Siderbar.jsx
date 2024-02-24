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
  Switch,
  Flex,
  Container,
  Text,
  background,
  useDisclosure,
  useColorMode
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
import { FiHome, FiUsers, FiSettings, FiLogOut, FiMoon,FiPieChart,FiAirplay ,FiAlertTriangle  } from 'react-icons/fi'
import { MdManageSearch } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { CiLight } from "react-icons/ci";
import { MdOutlineLightMode } from "react-icons/md";
import {
  Page, PageHeader, PageBody, DataGrid,
  DataGridPagination, Toolbar,
  ToolbarButton,
} from '@saas-ui-pro/react'
import '../../Mod.css';
import { BrowserRouter as Router, Route, Routes, useNavigate , NavLink ,useLocation } from 'react-router-dom';

export default function Siderbar() {
  let navigate = useNavigate();
   const { pathname } = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({
    defaultIsOpen: false,
  })

  const handleColorModeToggle = () => {
    toggleColorMode();
  };

  return (
    <Sidebar variant={isOpen ? 'default' : 'compact'}>
      <SidebarToggleButton />
      <SidebarSection direction="row">
        <Image
          style={{ cursor: 'pointer' }}
          src="https://saas-ui.dev/favicons/favicon-96x96.png"
          boxSize="7"
          onClick={onToggle}
        />
        <Spacer />

        {isOpen && <Menu>
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
        </Menu>}
      </SidebarSection>
      <SidebarSection aria-label="Main">
        <NavItem cursor='pointer' icon={<FiHome /> } onClick={() => { navigate('logs'); }} isActive={pathname.includes('logs')}>
   
        </NavItem>
        <NavItem cursor='pointer' icon={<FiPieChart />} onClick={() => { navigate('metrics'); } }  isActive={pathname.includes('metrics')}>Metrics</NavItem>
        <NavItem cursor='pointer' icon={<FiAirplay />} onClick={() => { navigate('dashboard'); } }  isActive={pathname.includes('dashboard')}>Dashboard</NavItem>
        <NavItem cursor='pointer' icon={<FiAlertTriangle />} onClick={() => { navigate('alert'); } }  isActive={pathname.includes('alert')}>Alert</NavItem>
        <NavItem cursor='pointer' icon={<TbReportSearch />} onClick={() => { navigate('trace'); } }  isActive={pathname.includes('trace')}>Traces</NavItem>
        <NavItem  cursor='pointer'icon={<FiSettings />}>Settings</NavItem>
      </SidebarSection>
      {!isOpen && <SidebarSection>
        <NavItem icon={<FiLogOut />}>Logout</NavItem>
      </SidebarSection>}

      <Spacer />  <Spacer />  <Spacer />  <Spacer />
      <SidebarSection>


        <NavItem cursor='pointer' icon={colorMode === 'light' ? <FiMoon /> : <MdOutlineLightMode />} isActive={colorMode === 'light' ? false : true} onClick={handleColorModeToggle}>
          {colorMode === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        </NavItem>
      </SidebarSection>
    </Sidebar>
  )
}

