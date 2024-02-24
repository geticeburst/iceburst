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
import Siderbar from './Siderbar'


function Main(props) {
    return (

        <Flex minH="100vh" align="center" justify="center" >
            <Container>
                <AppShell
                    sidebar={<Siderbar />}
                >
                    {props?.children}
                </AppShell>
            </Container>
        </Flex>

    );
}

export default Main;