export const formatNumberWithCommas = (number) => {
  if (number === undefined || number === null || isNaN(Number(number))) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(number));
};
