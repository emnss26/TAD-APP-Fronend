import { parseISO, isValid, format as dfFormat } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateInput) {
  if (!dateInput) return '';
  let date;
  if (typeof dateInput === 'string') {
    date = parseISO(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return '';
  }
  if (!isValid(date)) return '';
  return dfFormat(date, 'dd/MM/yyyy', { locale: es });
}

export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  
