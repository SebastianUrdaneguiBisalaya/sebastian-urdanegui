export const extractYearFromDate = (date: string) => {
    const dateArray = date.split("-");
    return dateArray[0];
};