export const MAEXLE_NUMERIC_VALUE = 210
export const VALUES = [
  {label: '31', numericValue: 31},
  {label: '32', numericValue: 32},
  {label: '41', numericValue: 41},
  {label: '42', numericValue: 42},
  {label: '43', numericValue: 43},
  {label: '51', numericValue: 51},
  {label: '52', numericValue: 52},
  {label: '53', numericValue: 53},
  {label: '54', numericValue: 54},
  {label: '61', numericValue: 61},
  {label: '62', numericValue: 62},
  {label: '63', numericValue: 63},
  {label: '64', numericValue: 64},
  {label: '65', numericValue: 65},
  {label: '1er Pasch', numericValue: 101},
  {label: '2er Pasch', numericValue: 102},
  {label: '3er Pasch', numericValue: 103},
  {label: '4er Pasch', numericValue: 104},
  {label: '5er Pasch', numericValue: 105},
  {label: '6er Pasch', numericValue: 106},
  {label: 'Mäxle', numericValue: MAEXLE_NUMERIC_VALUE}
]

export function getRollText (roll) {
  const value = VALUES.find(value => value.numericValue === roll)
  return value ? value.label : undefined
}

export function valuesGreaterOrEqual(minimumValue) {
  return VALUES.filter(value => value.numericValue >= minimumValue)
}
