def normalize_value(value):
    """
    Convert various number formats into numeric values and return the suffix/unit.
    Handles:
    - Values with 'M' or 'B' suffixes (e.g., '234M', '1.5B')
    - Comma-separated numbers (e.g., '100,300', '45,567,876')
    - Percentage values (e.g., '42%', '12.5%')
    - Metric values (e.g., '100m')
    
    Returns:
    - tuple: (numeric_value, suffix)
    
    Examples:
        '234M' -> (234000000.0, 'M')
        '1.5B' -> (1500000000.0, 'B')
        '100,300' -> (100300.0, '')
        '45,567,876' -> (45567876.0, '')
        '42%' -> (0.42, '%')
        '100m' -> (100.0, 'm')
    """
    if not isinstance(value, str):
        value = str(value)
    
    value = value.strip()
    suffix = ''
    
    # Handle percentage values
    if value.endswith('%'):
        numeric_value = float(value.replace(',', '').rstrip('%')) / 100
        return numeric_value, '%'
    
    # Handle M/B suffixes
    if value.endswith('M'):
        numeric_value = float(value[:-1].replace(',', '')) * 1e6
        suffix = 'M'
    elif value.endswith('B'):
        numeric_value = float(value[:-1].replace(',', '')) * 1e9
        suffix = 'B'
    elif value.endswith('m'):  # Meters or similar metric units
        numeric_value = float(value[:-1].replace(',', ''))
        suffix = 'm'
    else:  # Handle plain numeric values with possible commas
        numeric_value = float(value.replace(',', ''))
    
    return numeric_value, suffix