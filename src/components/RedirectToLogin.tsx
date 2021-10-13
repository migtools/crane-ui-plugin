import * as React from "react";
import { useEffect } from "react";

const RedirectToLogin: React.FunctionComponent<{}> = () => {
  useEffect(() => {
    // window.location.href = "/k8s/login"
    window.location.href = "/api/plugins/mig-ui-plugin/login";
  }, []);
  return null;
};

export default RedirectToLogin;
