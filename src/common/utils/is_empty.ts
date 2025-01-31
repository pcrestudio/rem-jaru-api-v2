export default function isEmpty(data: object) {
  for (const prop in data) {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      return false;
    }
  }

  return true;
}
