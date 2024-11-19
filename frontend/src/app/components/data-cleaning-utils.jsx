// Utility function to remove currency symbols and commas
const stripFormatting = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return value.toString().replace(/[$,]/g, '');
  };
  
  // Convert denomination strings (k, M, B) to full numbers
  const convertDenomination = (value) => {
    if (typeof value === 'number') return value;
    const multipliers = {
      k: 1000,
      K: 1000,
      m: 1000000,
      M: 1000000,
      b: 1000000000,
      B: 1000000000
    };
    
    const match = value.toString().match(/^[\d,.]+\s*[kKmMbB]$/);
    if (match) {
      const number = parseFloat(stripFormatting(value.slice(0, -1)));
      const denomination = value.slice(-1);
      return number * multipliers[denomination];
    }
    return parseFloat(stripFormatting(value));
  };
  
  // Handle percentage values
  const convertPercentage = (value) => {
    if (typeof value === 'number') return value;
    if (value.toString().includes('%')) {
      return parseFloat(value.replace('%', '')) / 100;
    }
    return parseFloat(value);
  };
  
  // Main data cleaning function
  const cleanNumericData = (value, type) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
  
    try {
      switch (type) {
        case 'number':
          return parseFloat(stripFormatting(value)) || 0;
        
        case 'numbercomma':
          return parseFloat(stripFormatting(value)) || 0;
        
        case 'numbercurrency':
          return parseFloat(stripFormatting(value)) || 0;
        
        case 'numbercombocomacurrency':
          return parseFloat(stripFormatting(value)) || 0;
        
        case 'numberpercentage':
          return convertPercentage(value);
        
        case 'numberdenomination':
          return convertDenomination(value);
        
        case 'text':
          return value;
        
        default:
          return value;
      }
    } catch (error) {
      console.error(`Error cleaning value: ${value}`, error);
      return 0;
    }
  };
  
  export { cleanNumericData };