import { formatISO } from "date-fns"

export const getFormattedDate = (date: Date) => formatISO(date).split("+")[0]
