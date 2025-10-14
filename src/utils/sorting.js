export const sortStocks = (stocks, column, direction) => {
  return [...stocks].sort((a, b) => {
    let aValue = a[column];
    let bValue = b[column];
    
    if (column === 'symbol') {
      aValue = aValue.toString();
      bValue = bValue.toString();
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    aValue = Number(aValue);
    bValue = Number(bValue);
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
};

