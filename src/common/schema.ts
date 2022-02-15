import * as yup from 'yup';
import * as yaml from 'js-yaml';
import { useSourceNamespacesQuery } from 'src/api/queries/sourceResources';

export const dnsLabelNameSchema = yup
  .string()
  .max(63)
  .matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: ({ label }) =>
      `${label} can only contain lowercase alphanumeric characters and dashes (-), and must start and end with an alphanumeric character`,
    excludeEmptyString: true,
  });

export const getSourceNamespaceSchema = (
  sourceNamespacesQuery: ReturnType<typeof useSourceNamespacesQuery>,
  credentialsAreValid: boolean,
) =>
  dnsLabelNameSchema.required().test('exists', (value, context) => {
    if (value && !credentialsAreValid) {
      return context.createError({
        message: 'Cannot validate project name without connecting to the cluster',
      });
    }
    const namespaceExists = sourceNamespacesQuery.data?.data.items.find(
      (ns) => ns.metadata.name === value,
    );
    if (value && !namespaceExists) {
      return context.createError({
        message: 'This project does not exist in the source cluster',
      });
    }
    return true;
  });

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
      if (e.reason && e.mark) {
        return context.createError({
          message: `${context.schema.describe().label}: ${e.reason} (${e.mark.line}:${
            e.mark.column
          })`,
        });
      }
      return false;
    }
    return true;
  },
});
