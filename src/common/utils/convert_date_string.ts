import { ZonedDateTime } from "@internationalized/date";

function convertToZonedDateTime(input: string | any): ZonedDateTime | null {
  let date: Date;

  if (typeof input === "string") {
    const cleanInput = input.replace(/\[.*?\]/g, "");
    date = new Date(cleanInput);
    if (isNaN(date.getTime())) {
      return null;
    }
  } else if (typeof input === "object" && input.calendar?.identifier) {
    date = new Date(
      Date.UTC(
        input.year,
        input.month - 1,
        input.day,
        input.hour || 0,
        input.minute || 0,
        input.second || 0,
      ),
    );
  } else {
    return null;
  }

  return new ZonedDateTime(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    "UTC",
    0,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

const convertDateString = (date: ZonedDateTime) => {
  const zonedDateTime = new ZonedDateTime(
    date.year,
    date.month,
    date.day,
    "America/Lima",
    0,
  );

  const dateValue = zonedDateTime.toDate();

  return dateValue.toUTCString();
};

const processDate = (dateExpiration: any): string => {
  if (!dateExpiration) {
    return "";
  }

  if (dateExpiration instanceof ZonedDateTime) {
    return convertDateString(dateExpiration);
  }

  const zonedDateTime = convertToZonedDateTime(dateExpiration);

  if (!zonedDateTime) {
    throw new Error(`Invalid date format: ${dateExpiration}`);
  }

  return convertDateString(zonedDateTime);
};

export default processDate;
