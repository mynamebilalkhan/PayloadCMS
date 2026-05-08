export { validateBlockSchema, assertValidBlockSchema } from './schemaValidator'
export { validateBlockData } from './dataValidator'
export { evaluateConditions } from './evaluateConditions'
export type {
  BlockSchema,
  BlockField,
  FieldType,
  BlockData,
  ValidationResult,
  DataValidationResult,
  // Leaf types
  TextField,
  TextareaField,
  RichTextField,
  NumberField,
  CheckboxField,
  SelectField,
  MultiSelectField,
  DateField,
  ImageField,
  FileField,
  UrlField,
  EmailField,
  ColorField,
  ArrayField,
  GroupField,
  RelationshipField,
  JsonField,
  SelectOption,
  // Feature 1: Conditional Logic
  ConditionRule,
  ConditionOperator,
  // Feature 2: Advanced Validation
  ValidationRules,
  // Feature 3: UI Metadata
  UIMetadata,
  UIWidth,
  // Feature 4: Nested Blocks
  BlocksField,
  NestedBlockValue,
} from './types'
