import { Auth } from '@saas-ui/auth';
import { Card, CardHeader, CardBody } from '@chakra-ui/react';
import logo from './assets/logo.png';

export default function SignupPage() {
  return (
    <Card maxW="400px" mx="auto" my="10">
      <CardHeader display="flex" justifyContent="center">
      <img src={logo} width="200px" alt="Iceburst" />
      </CardHeader>
      <CardBody>
        <Auth view="signup" />
      </CardBody>
    </Card>
  );
}