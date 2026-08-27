export function filterCustomers(customers = [], query = "") {
  if (!query.trim()) return customers;

  const lowerQuery = query.trim().toLowerCase();

  return customers.filter((cust) => {
    const fullName = `${cust?.firstName ?? ""} ${cust?.lastName ?? ""}`.toLowerCase();
    return (
      fullName.includes(lowerQuery) ||
      cust?.email?.toLowerCase().includes(lowerQuery) ||
      cust?.phone?.includes(lowerQuery)
    );
  });
}
