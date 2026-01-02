// Параметр сортировки (элемент массива `order`)
export interface OrderItem {
  field: string; // имя поля для сортировки
  direction: 'asc' | 'desc' | string; // направление сортировки
}

// Общий тип для where — можно уточнить под вашу DSL запроса
export type WhereItem = Record<string, unknown>;

// Интерфейс запроса (reqData)
export interface ReqData {
  include?: string[]; // какие связанные сущности включить
  where?: WhereItem[]; // фильтры (массив условий)
  order?: OrderItem[]; // порядок сортировки
  take?: number; // количество для страницы (limit)
  skip?: number; // смещение (offset)
  count?: boolean; // вернуть общее количество
}
