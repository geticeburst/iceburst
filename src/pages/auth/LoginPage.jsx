import { Auth } from '@saas-ui/auth';
import { Card, CardHeader, CardBody } from '@chakra-ui/react';
import { FaGithub, FaGoogle } from 'react-icons/fa'


export default function LoginPage() {
  return (
    <Card maxW="400px" mx="auto" my="10">
      <CardHeader display="flex" justifyContent="center">
        <img src='https://www.iceburst.io/assets/iceburst.png' width="200px" alt="Iceburst" />
      </CardHeader>
      <CardBody>
      <Auth 
          type="password" 
          view="login"
          providers={{
            github: {
              icon: FaGithub,
              name: 'Github',
            },
            google: {
              icon: FaGoogle,
              name: 'Google',
            },
          }}
        />
      </CardBody>
    </Card>
  );
}