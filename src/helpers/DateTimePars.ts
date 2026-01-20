export function parseDateTime(value: string, dataType: string, timeZone: number): string {
  let result = value;
  if (!value) {
    return result;
  }
  if (dataType === 'TIMESTAMPTZ') {
    let date = new Date(value);
    date = new Date(date.getTime() + timeZone * 60 * 60 * 1000);
    result = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  }
  if (dataType === 'DATE') {
    const date = new Date(value);
    result = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return result;
}
