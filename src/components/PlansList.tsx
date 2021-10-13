import * as React from "react";
import { usePlansQuery } from "./plans";

const PlansList: React.FC = () => {
  const plansQuery = usePlansQuery();
  console.log("plansQuery", plansQuery);
  // const [data, loaded] = useK8sWatchResource<K8sResourceCommon[]>({
  //   kind: 'Pod',
  //   isList: true,
  // });
  return (
    <div>
      Plans list:
      {plansQuery?.data?.items.map((d) => (
        <div key={d.metadata.name}>{d.metadata.name}</div>
      ))}
      {/* <div>The WebSocket is currently {connectionStatus}</div>
      {lastJsonMessage ? <span>Last message: {lastJsonMessage?.data?.kind}</span> : null}
      <ul></ul> */}
    </div>
  );
};

export default PlansList;
