import { PageSection } from "@patternfly/react-core/dist/esm/components/Page/PageSection";
import * as React from "react";
import { ResolvedQuery } from "@konveyor/lib-ui";
import { Card } from "@patternfly/react-core/dist/esm/components/Card/Card";
import { CardBody } from "@patternfly/react-core/dist/esm/components/Card/CardBody";
import { EmptyState } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyState";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { EmptyStateIcon } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateIcon";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { Title } from "@patternfly/react-core/dist/esm/components/Title/Title";
import { EmptyStateBody } from "@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateBody";
import CreatePlanButton from "../../common/CreatePlanButton";
import { useStorageReposQuery } from "../../queries/storageRepos";
import StorageReposTable from "./StorageReposTable";

const StorageReposList: React.FC = () => {
  const storageReposQuery = useStorageReposQuery();
  return (
    <PageSection>
      <ResolvedQuery
        result={storageReposQuery}
        errorTitle={"Could not load clusters"}
        errorsInline={false}
      >
        <Card>
          <CardBody>
            {!storageReposQuery.data ? null : storageReposQuery.data.items
                .length === 0 ? (
              <EmptyState className={spacing.my_2xl}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title size="lg" headingLevel="h2">
                  No clusters
                </Title>
                <EmptyStateBody>
                  Create a cluster to migrate to or from{" "}
                </EmptyStateBody>
                <CreatePlanButton />
              </EmptyState>
            ) : (
              <StorageReposTable
                storageList={storageReposQuery.data?.items || []}
              />
            )}
          </CardBody>
        </Card>
      </ResolvedQuery>
    </PageSection>
  );
};

export default StorageReposList;
