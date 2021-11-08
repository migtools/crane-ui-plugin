import { useLocation, Redirect } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import * as React from 'react';

const LoginHandlerComponent: React.FunctionComponent = () => {
  const history = useHistory();
  const searchParams = new URLSearchParams(useLocation().search);
  const userStr = searchParams.get('user');
  const errorStr = searchParams.get('error');
  let user: any;
  let loginError: any;
  try {
    user = userStr && JSON.parse(userStr);
    loginError = errorStr && JSON.parse(errorStr);
  } catch (error) {
    user = null;
    loginError = null;
  }

  useEffect(() => {
    if (loginError) {
      console.log('Authentication error: ', loginError.message);
      history.push('/auth-error');
    } else if (user) {
      //redirect
    }
  }, []);

  return user ? null : <Redirect to="/" />;
};

export default LoginHandlerComponent;
