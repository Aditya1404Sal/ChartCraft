def normalize_value(value):
    """
    Convert values with 'M' or 'B' suffixes into numeric format and return the suffix.
    Examples:
        '234M' -> (234e6, 'M')
        '1.5B' -> (1.5e9, 'B')
    """
    value = str(value)
    value = value.strip()
    suffix = ''
    if value.endswith('M'):
        numeric_value = float(value[:-1]) * 1e6
        suffix = 'M'
    elif value.endswith('B'):
        numeric_value = float(value[:-1]) * 1e9
        suffix = 'B'
    elif value.endswith('m'):  # Meters or similar metric units
        numeric_value = float(value[:-1])
        suffix = 'm'
    else:  # Assume plain numeric value if no recognized suffix
        numeric_value = float(value)  # Assume plain numeric value if no suffix
    return numeric_value, suffix