import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import ClustersList from "./components/ClustersList";

const ClustersPage: React.FC = () => {
  const queryClient = new QueryClient();
  // TODO: Handle Auth when the shared token is made available from the console.
  // https://github.com/openshift/api/pull/1020
  return (
    <QueryClientProvider client={queryClient}>
      <ClustersList></ClustersList>
    </QueryClientProvider>
  );
};

export default ClustersPage;
