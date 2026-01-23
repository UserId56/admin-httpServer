export function ShortViewPars(
  shortView: string,
  refName: string,
  row: any,
  isMultiple: boolean,
  dataRefScheme: any,
  refScheme: string,
): any[] {
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  const result: any[] = [];
  if (!isMultiple) {
    let strData = shortView;
    const names = Array.from(shortView.matchAll(re), (m) => m[1]);
    const value = row[refName];
    if (!value) {
      return result;
    }
    names.forEach((name) => {
      for (const itemData of dataRefScheme) {
        if (itemData.id === value || itemData.file_id === value) {
          const value = itemData[name as keyof typeof itemData];
          strData = strData.replace(`{${name}}`, value ? String(value) : '');
        }
      }
    });
    result.push({
      title: strData,
      scheme: refScheme,
      id: row[refName],
    });
  } else {
    const arr = row[refName];
    if (!arr) {
      return result;
    }
    for (const item of arr) {
      let itemStr = shortView;
      const names = Array.from(shortView.matchAll(re), (m) => m[1]);
      names.forEach((name) => {
        for (const itemData of dataRefScheme) {
          if (itemData.id === item) {
            const value = itemData[name as keyof typeof itemData];
            itemStr = itemStr.replace(`{${name}}`, value ? String(value) : '');
          }
        }
      });
      result.push({
        title: itemStr,
        scheme: refScheme,
        id: item,
      });
    }
  }
  return result;
}

export function GetIncludeFields(shortView: string): Array<string> {
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  const names = Array.from(shortView.matchAll(re), (m) => m[1]);
  return names.filter((name) => name !== 'id') as Array<string>;
}

export function GetNameAsShortView(shortView: string, data: any): string {
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  let strData = shortView;
  const names = Array.from(shortView.matchAll(re), (m) => m[1]);
  names.forEach((name) => {
    const value = data[name as keyof typeof data];
    strData = strData.replace(`{${name}}`, value ? String(value) : '');
  });
  return strData;
}
