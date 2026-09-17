import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useSnackbar } from "notistack";
import { getUserOrderHistory } from "../../services/storeServices";
import { SidebarContext } from "../../context/SidebarProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import BackButton from "../../components/Common/BackButton";
import { filterOrdersByQuery, filterOrdersByDateRange } from "../../utils/filterStores";
import { formatFullAddress } from "../../utils/dateUtils";

export default function CustomerDetailsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { userId } = useParams();
  const { navbarInput } = useContext(SidebarContext);
  const [debouncedSearchText] = useDebounce(navbarInput, 300);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const companyName = "MADHU Dairy & Daily Needs";
  const appLink = "http://localhost:5173";

  useEffect(() => {
    const handleUserOrdersHistory = async () => {
      try {
        setLoading(true);
        const data = await getUserOrderHistory(userId);
        if (data?.success) {
          setUserData(data?.orders);
        }
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message || "Failed to fetch customer profile details.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    handleUserOrdersHistory();
  }, [userId, enqueueSnackbar]);

  if (loading) {
    return <BuffaloLoader variant="inline" text="Loading Customer Profile Details..." />;
  }

  if (!userData) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <BackButton fallbackPath="/admin/customers" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-4">Customer Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">Unable to locate customer details for ID: {userId}</p>
        </div>
      </div>
    );
  }

  const { firstName, lastName, username, email, mobileNo, gender, photo, orders = [] } = userData;
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || username || "Customer";
  const initial = (firstName || username || "C").charAt(0).toUpperCase();

  const textFilteredOrders = filterOrdersByQuery(orders || [], debouncedSearchText);
  const filteredOrders = filterOrdersByDateRange(textFilteredOrders, fromDate, toDate);

  const totalSpent = (orders || []).reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const getAvatarGradient = (name) => {
    const gradients = [
      "from-purple-600 to-purple-800 text-white shadow-purple-500/20",
      "from-purple-700 to-zinc-900 text-white shadow-purple-900/20",
      "from-violet-600 to-purple-900 text-white shadow-violet-500/20",
      "from-zinc-800 to-purple-950 text-white shadow-zinc-800/20",
      "from-purple-500 to-violet-700 text-white shadow-purple-500/20",
      "from-zinc-900 to-purple-800 text-white shadow-purple-900/20",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <BackButton fallbackPath="/admin/customers" />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Customer Full Profile & Orders</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Detailed account profile, direct contact options, and complete transaction history.</p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
            Customer ID: {userId?.slice(-8)?.toUpperCase()}
          </span>
        </div>

        {/* Profile Card Summary & Action Buttons */}
        <div className="flex flex-col md:flex-row items-start gap-6 bg-gray-50/80 dark:bg-gray-700/40 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-700">
          {photo ? (
            <img
              src={photo}
              alt={fullName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border-2 border-purple-200 dark:border-purple-800 shrink-0"
            />
          ) : (
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${getAvatarGradient(fullName)} flex items-center justify-center font-black text-4xl sm:text-5xl shrink-0 shadow-lg`}>
              {initial}
            </div>
          )}

          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-gray-600 pb-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{fullName}</h2>
                <p className="text-xs font-bold text-[#6C5CE7] dark:text-purple-300">
                  {username ? `@${username}` : "Registered Customer Account"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs">
                  ✓ Active Account
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs">
                  📦 {orders.length} Total Orders
                </span>
              </div>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-100/80 dark:border-gray-700 shadow-xs space-y-0.5">
                <span className="font-bold text-gray-400 text-[10px] uppercase block">Email Address</span>
                <a href={`mailto:${email}`} className="font-bold text-[#6C5CE7] dark:text-purple-300 hover:underline flex items-center gap-1 truncate">
                  <EmailIcon sx={{ fontSize: "0.95rem" }} />
                  <span className="truncate">{email || "N/A"}</span>
                </a>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-100/80 dark:border-gray-700 shadow-xs space-y-0.5">
                <span className="font-bold text-gray-400 text-[10px] uppercase block">Mobile Number</span>
                {mobileNo ? (
                  <a href={`tel:${mobileNo}`} className="font-bold text-[#6C5CE7] dark:text-purple-300 hover:underline flex items-center gap-1">
                    <CallIcon sx={{ fontSize: "0.95rem" }} />
                    <span>{mobileNo}</span>
                  </a>
                ) : (
                  <span className="font-bold text-gray-600 dark:text-gray-300">N/A</span>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-100/80 dark:border-gray-700 shadow-xs space-y-0.5">
                <span className="font-bold text-gray-400 text-[10px] uppercase block">Gender</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                  <PersonIcon sx={{ fontSize: "0.95rem" }} className="text-[#6C5CE7]" />
                  <span>{gender || "Not Specified"}</span>
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-100/80 dark:border-gray-700 shadow-xs space-y-0.5">
                <span className="font-bold text-gray-400 text-[10px] uppercase block">Total Spent</span>
                <span className="font-extrabold text-[#6C5CE7] dark:text-purple-300 flex items-center gap-1">
                  <ShoppingBagIcon sx={{ fontSize: "0.95rem" }} />
                  <span>₹{totalSpent.toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`https://wa.me/91${mobileNo || "9490644434"}?text=${encodeURIComponent(
                  `Hello ${firstName || fullName}, I'm contacting you from *${companyName}*.\nApp: ${appLink}\nMessage: `
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition"
              >
                <WhatsAppIcon sx={{ fontSize: "1.1rem" }} />
                <span>WhatsApp Customer</span>
              </a>

              {mobileNo && (
                <a
                  href={`tel:${mobileNo}`}
                  className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 text-[#6C5CE7] dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <CallIcon sx={{ fontSize: "1rem" }} />
                  <span>Call {mobileNo}</span>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 text-[#6C5CE7] dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <EmailIcon sx={{ fontSize: "1rem" }} />
                  <span>Email {email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        {/* Filters & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="text-[#6C5CE7]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Orders History ({orders.length})</h2>
          </div>

          {/* Date Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-xs">
              <FilterListIcon sx={{ fontSize: "0.95rem" }} className="text-gray-400" />
              <span className="font-bold text-gray-500">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-xs">
              <span className="font-bold text-gray-500">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition"
              >
                Reset Dates
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        {!filteredOrders.length ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10 text-sm font-semibold">
            No orders found matching the filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-gray-50/80 dark:bg-gray-700/40 rounded-2xl border border-gray-200/70 dark:border-gray-700 p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <AssignmentTurnedInIcon className="text-[#6C5CE7]" fontSize="small" />
                  <span className="font-bold text-gray-500">Order ID:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">#{order._id?.slice(-8)?.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <LocationOnIcon className="text-[#6C5CE7]" fontSize="small" />
                  <span className="font-bold text-gray-500">Address:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{formatFullAddress(order?.address)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CallIcon className="text-[#6C5CE7]" fontSize="small" />
                  <span className="font-bold text-gray-500">Contact:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{order?.address?.phone || mobileNo}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CalendarMonthIcon className="text-[#6C5CE7]" fontSize="small" />
                  <span className="font-bold text-gray-500">Ordered:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-gray-600">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold uppercase">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 dark:divide-gray-600 bg-white dark:bg-gray-800">
                    {(order.productsData || []).map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="px-3 py-2 font-bold text-gray-900 dark:text-white">{item?.productId?.name || "Product"}</td>
                        <td className="px-3 py-2 text-center font-bold">{item?.productQuantity || 1}</td>
                        <td className="px-3 py-2 font-medium">₹{(item?.productPrice || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#6C5CE7]">
                          ₹{((item?.productPrice || 0) * (item?.productQuantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-gray-200/60 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500">
                    Status: <span className="text-[#6C5CE7] dark:text-purple-300 font-black">{order.status || "Processing"}</span>
                  </span>
                  <span className="font-bold text-gray-500">
                    Payment Mode: <span className="text-gray-800 dark:text-gray-200 font-black">{order.paymentMode || order.paymentMethod || "COD"}</span>
                  </span>
                </div>

                <div className="text-sm font-black text-gray-900 dark:text-white">
                  Total: <span className="text-[#6C5CE7] dark:text-purple-300">₹{(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
