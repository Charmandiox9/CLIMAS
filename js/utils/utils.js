export function formatDate(date) {
  return new Intl.DateTimeFormat('es-CL').format(date);
}