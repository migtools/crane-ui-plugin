import { PageSection } from "@patternfly/react-core/dist/esm/components/Page/PageSection";
import * as React from "react";
import { usePlansQuery } from "./plans";
import { ResolvedQuery } from "@konveyor/lib-ui";
import { Card } from "@patternfly/react-core/dist/esm/components/Card/Card";
import { CardBody } from "@patternfly/react-core/dist/esm/components/Card/CardBody";
import { EmptyState } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyState";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { EmptyStateIcon } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateIcon";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { Title } from "@patternfly/react-core/dist/esm/components/Title/Title";
import { EmptyStateBody } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateBody";
import CreatePlanButton from "./CreatePlanButton";
import PlansTable from "./PlansTable";

const PlansList: React.FC = () => {
  const plansQuery = usePlansQuery();
  return (
    <PageSection>
      <ResolvedQuery
        result={plansQuery}
        errorTitle={"Could not load plans"}
        errorsInline={false}
      >
        <Card>
          <CardBody>
            {!plansQuery.data ? null : plansQuery.data.items.length === 0 ? (
              <EmptyState className={spacing.my_2xl}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title size="lg" headingLevel="h2">
                  No migration plans
                </Title>
                <EmptyStateBody>
                  Create a migration plan to select clusters to migrate to{" "}
                </EmptyStateBody>
                <CreatePlanButton />
              </EmptyState>
            ) : (
              // <div>
              //   Plans list:
              //   {plansQuery?.data?.items.map((d) => (
              //     <div key={d.metadata.name}>{d.metadata.name}</div>
              //   ))}
              // </div>
              <PlansTable planList={plansQuery.data?.items || []} />
            )}
          </CardBody>
        </Card>
      </ResolvedQuery>
    </PageSection>
  );
};

export default PlansList;
