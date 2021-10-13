import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import PlansList from "./PlansList";

const PlansPage: React.FC = () => {
  const queryClient = new QueryClient();
  // TODO: Handle Auth when the shared token is made available from the console.
  // https://github.com/openshift/api/pull/1020
  return (
    <QueryClientProvider client={queryClient}>
      <PlansList></PlansList>
    </QueryClientProvider>
  );
};

export default PlansPage;
