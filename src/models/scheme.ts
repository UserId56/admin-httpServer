export interface Column {
  id?: number;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
  DeletedAt?: string | null;
  dynamic_table_id?: number;
  column_name: string;
  display_name: string;
  data_type: string;
  referenced_scheme: string | null;
  is_unique?: boolean;
  not_null?: boolean;
  default_value?: string | null;
  validation_rules?: unknown[] | null;
}

export interface Scheme {
  id?: number;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
  DeletedAt?: string | null;
  name: string;
  display_name: string;
  columns: Column[] | null;
}
