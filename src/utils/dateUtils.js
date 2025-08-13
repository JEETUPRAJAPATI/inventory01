import { format, parseISO } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "dd/MM/yyyy");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "yyyy-MM-dd HH:mm:ss");
};
export function formatToIndianDateTimeLines(isoString) {
  const date = new Date(isoString);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const formattedTime = date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}\n${formattedTime}`;
}
