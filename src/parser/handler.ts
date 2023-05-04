function extractCharPosition(error_message: string): number {
  const char_pattern = /char (\d+)/
  const match = char_pattern.exec(error_message)
  if (match)
    return parseInt(match[1])
  else
    throw new Error('Character position not found in the error message.')
}

function addQuotesToPropertyNames(json_string: string): string {
  const replace_func = (_: string, name: string): string => {
    return `"${name}":`
  }

  const property_name_pattern = /(\w+):/g
  const corrected_json_string = json_string.replace(property_name_pattern, replace_func)

  JSON.parse(corrected_json_string)
  return corrected_json_string
}

function balanceBraces(json_string: string): string {
  const open_braces_count = json_string.split('{').length - 1
  let close_braces_count = json_string.split('}').length - 1

  while (open_braces_count > close_braces_count) {
    json_string += '}'
    close_braces_count += 1
  }

  while (close_braces_count > open_braces_count) {
    json_string = json_string.slice(0, -1)
    close_braces_count -= 1
  }

  JSON.parse(json_string)
  return json_string
}

function fixInvalidEscape(json_str: string, error_message: string): string {
  while (error_message.startsWith('Invalid \\escape')) {
    const bad_escape_location = extractCharPosition(error_message)
    json_str = json_str.slice(0, bad_escape_location) + json_str.slice(bad_escape_location + 1)
    try {
      JSON.parse(json_str)
      return json_str
    }
    catch (e) {
      error_message = e.toString()
    }
  }
  return json_str
}

export function correctJson(json_str: string): string {
  try {
    JSON.parse(json_str)
    return json_str
  }
  catch (e) {
    const error_message = e.toString()
    if (error_message.startsWith('Invalid \\escape'))
      json_str = fixInvalidEscape(json_str, error_message)

    if (error_message.startsWith('Expecting property name enclosed in double quotes')) {
      json_str = addQuotesToPropertyNames(json_str)
      JSON.parse(json_str)
      return json_str
    }
    const balanced_str = balanceBraces(json_str)
    if (balanced_str)
      return balanced_str
  }
  return json_str
}
