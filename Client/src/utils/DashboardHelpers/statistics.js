import dayjs from "dayjs";

export const getLast7DaysOrderStats = (orders = []) => {
  const statsMap = {};

  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, "day");
    const key = date.format("YYYY-MM-DD");
    statsMap[key] = {
      label: date.format("dddd"), // Convert to weekday name
      Purchase: 0,
      Return: 0,
      Cancel: 0,
    };
  }

  orders?.forEach((order) => {
    const orderDate = dayjs(order?.createdAt)?.format("YYYY-MM-DD");

    if (!statsMap?.[orderDate]) return;

    const amount = order?.totalAmount ?? 0;
    const status = order?.status;

    if (status === "Cancelled") {
      statsMap[orderDate].Cancel += amount;
    } else if (status === "Returned") {
      statsMap[orderDate].Return += amount;
    } else if (["Delivered", "Confirmed"].includes(status)) {
      statsMap[orderDate].Purchase += amount;
    }
  });

  const labels = Object.keys(statsMap).map(date => statsMap[date].label);

  const dataset = {
    labels,
    datasets: {
      Purchase: Object.values(statsMap).map(day => day.Purchase),
      Return: Object.values(statsMap).map(day => day.Return),
      Cancel: Object.values(statsMap).map(day => day.Cancel),
    },
  };

  return dataset;
};
