import * as yup from 'yup';
import * as yaml from 'js-yaml';
import { useWatchPipelines } from 'src/api/queries/pipelines';
import { useValidateSourceNamespaceQuery } from 'src/api/queries/sourceResources';

export const dnsLabelNameSchema = yup
  .string()
  .max(63)
  .matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: ({ label }) =>
      `${label} can only contain lowercase alphanumeric characters and dashes (-), and must start and end with an alphanumeric character`,
    excludeEmptyString: true,
  });

export const getSourceNamespaceSchema = (
  validateSourceNamespaceQuery: ReturnType<typeof useValidateSourceNamespaceQuery> | null,
  credentialsAreValid: boolean,
) =>
  dnsLabelNameSchema.required().test('exists', (value, context) => {
    if (value && !credentialsAreValid) {
      return context.createError({
        message: 'Cannot validate project name without connecting to the cluster',
      });
    }
    const namespaceExists =
      validateSourceNamespaceQuery?.isSuccess &&
      validateSourceNamespaceQuery?.data?.data.kind === 'Namespace';
    if (value && !namespaceExists) {
      return context.createError({
        message: 'This project does not exist in the source cluster',
      });
    }
    return true;
  }) as yup.StringSchema<string>;

export const capacitySchema = yup.string().matches(/^(\d+)[KMGTP]i?$/, {
  message: ({ label }) =>
    `${label} must be in valid Binary SI (Ki, Mi, Gi, Pi, Ti) or Decimal SI (K, M, G, P, T) format`,
  excludeEmptyString: true,
});

export const yamlSchema = yup.string().test({
  name: 'valid-yaml',
  message: ({ label }) => `${label} must be valid YAML`,
  test: (value, context) => {
    try {
      yaml.load(value || '');
    } catch (e) {
      const error = e as { reason?: string; mark?: { line?: number; column?: number } };
      if (error.reason && error.mark) {
        return context.createError({
          message: `${context.schema.describe().label}: ${error.reason} (${error.mark.line}:${
            error.mark.column
          })`,
        });
      }
      return false;
    }
    return true;
  },
});

// TODO validate that the pipeline name doesn't exist already with -stage, -cutover suffixes either (if necessary?)
export const getPipelineNameSchema = (pipelinesWatch: ReturnType<typeof useWatchPipelines>) => {
  // k8s resource name length is limited to 63 characters.
  // We will use it as a prefix for generateName, which will add 6 characters.
  // We also may put a suffix of "-stage", "-cutover", or "-rollback" on the name, which adds up to 9 characters.
  const maxLength = 48; // 63 - 6 - 9
  return dnsLabelNameSchema
    .label('Pipeline name')
    .required()
    .max(maxLength) // So it can be used as the generateName for a PipelineRun, which will add 6 characters
    .test(
      'unique-name',
      'A pipeline with this name already exists',
      (value) =>
        !pipelinesWatch.loaded ||
        !pipelinesWatch.data?.find((pipeline) => pipeline.metadata?.name === value),
    );
};
