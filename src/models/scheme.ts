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
  is_multiple: boolean;
  is_unique: boolean;
  not_null: boolean;
  default_value: string | null;
  validation_rules: unknown[] | null;
}

export interface Scheme {
  id?: number;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
  DeletedAt?: string | null;
  name: string;
  display_name: string;
  view_data: ViewData;
  columns: Column[];
}

// Интерфейс для значения предустановленного списка
export interface PreValue {
  // Метка, отображаемая пользователю
  label: string;
  // Значение, используемое в коде/сервисе
  value: string;
}

// Опции поля вида/таблицы
export interface FieldOptions {
  hidden: boolean;
  filterable: boolean;
  order: number;
  // Может быть null или массив предустановленных значений
  pre_values: PreValue[];
}

// Данные для представления (view)
export interface ViewData {
  short_view: string;
  hide_menu: boolean;
  field_options: Record<string, FieldOptions>;
}
