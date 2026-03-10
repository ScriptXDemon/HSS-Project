function createCurrencyFormatter(locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export function formatIndianCurrency(amount: number, locale = 'en-IN') {
  return createCurrencyFormatter(locale).format(amount);
}

export function formatDisplayDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale = 'en-IN'
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...options,
  }).format(new Date(date));
}

export function formatDisplayDateTime(date: Date | string, locale = 'en-IN') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}
