const formatDateToLocale = (databaseDate: string) => {
  if (
    databaseDate === undefined ||
    databaseDate === null ||
    databaseDate === ""
  ) {
    return "";
  }

  const date = new Date(databaseDate);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default formatDateToLocale;
