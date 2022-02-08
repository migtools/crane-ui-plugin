import * as yup from 'yup';
import * as yaml from 'js-yaml';

export const dnsLabelNameSchema = yup
  .string()
  .max(63)
  .matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: ({ label }) =>
      `${label} can only contain lowercase alphanumeric characters and dashes (-), and must start and end with an alphanumeric character`,
    excludeEmptyString: true,
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
