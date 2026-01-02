export interface Column {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  dynamic_table_id: number;
  column_name: string;
  display_name: string;
  data_type: string;
  referenced_scheme: string | null;
  is_unique: boolean;
  not_null: boolean;
  default_value: string | null;
  validation_rules: unknown[] | null;
  [key: string]: unknown;
}

export interface Scheme {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  displayName: string;
  columns: Column[] | null;
  [key: string]: unknown;
}
