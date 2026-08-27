import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserOrderHistory } from "../../services/storeServices";
import { filterOrdersByQuery, filterOrdersByDateRange } from "../../utils/filterStores";
import { useDebounce } from "use-debounce";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuffaloLoader from '../../components/BuffaloLoader';
import CallIcon from '@mui/icons-material/Call';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { SidebarContext } from "../../context/SidebarProvider";
import { useSnackbar } from 'notistack';


import { formatFullAddress } from "../../utils/dateUtils";

export default function StoreOrdersHistory() {
    const { enqueueSnackbar } = useSnackbar();
    const { userId } = useParams();
    const { navbarInput } = useContext(SidebarContext);
    const [debouncedSearchText] = useDebounce(navbarInput, 300);

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");


    useEffect(() => {
        const handleUserOrdersHistory = async () => {
            try {
                const data = await getUserOrderHistory(userId);
                if (data?.success) {
                    setUserData(data?.orders);
                }
            } catch (error) {
                enqueueSnackbar(error?.response?.data?.message || "Failed to fetch orders.", { variant: "error" });
            } finally {
                setLoading(false);
            }
        }

        handleUserOrdersHistory();
    }, [userId, enqueueSnackbar]);

    if (loading) {
        return <BuffaloLoader variant="inline" text="Loading Order History..." />;
    }

    if (!userData.orders?.length) {
        return (
            <div className="text-center text-gray-500 dark:text-white py-10">
                No order history available.
            </div>
        );
    }

    const { firstName, lastName, shopName, orders } = userData;
    const titleName = shopName || `${firstName} ${lastName}`;

    const textFilteredOrders = filterOrdersByQuery(orders || [], debouncedSearchText);
    const filteredOrders = filterOrdersByDateRange(textFilteredOrders, fromDate, toDate);

    return (
        <div className="p-3">
            <div className="bg-white dark:bg-gray-500/20 rounded-lg p-3">
                <div className="flex flex-wrap items-center justify-between border-b pb-2 border-gray-500/20 mb-3">
                    <h2 className="text-xl text-gray-800 dark:text-white line-clamp-1">
                        Order History:{" "}
                        <span className="text-2xl text-green-500 font-bold">{(titleName).toUpperCase()}</span>
                    </h2>

                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-2 md:px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-500/10 dark:text-white"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-2 md:px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-500/10 dark:text-white"
                        />

                        <button
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                            }}
                            className="hidden md:flex px-2 md:px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
                        >
                            Reset Dates
                        </button>
                    </div>
                </div>

                {

                    !filteredOrders.length ? (
                        <div className="text-center text-gray-500 dark:text-white py-6">
                            No matching orders found.
                        </div>) : (filteredOrders.map((order) => (
                            <div key={order._id} className="mb-8 bg-white dark:bg-gray-500/10 rounded-lg shadow-lg p-4 space-y-4">

                                <div className="text-sm space-y-2">

                                    <div className="flex flex-wrap items-center gap-2 break-words">
                                        <AssignmentTurnedInIcon className="text-purple-600 dark:text-purple-400" fontSize="small" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Order ID:</span>
                                        <span className="text-gray-600 dark:text-gray-300 break-all">{order._id}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 break-words">
                                        <LocationOnIcon className="text-green-600 dark:text-green-400" fontSize="small" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Address:</span>
                                        <span className="text-gray-600 dark:text-gray-300 break-all">
                                            {formatFullAddress(order?.address)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 break-words">
                                        <CallIcon className="text-red-500 dark:text-red-400" fontSize="small" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Mobile:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{order?.address?.phone}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 break-words">
                                        <CalendarMonthIcon className="text-yellow-600 dark:text-yellow-400" fontSize="small" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Ordered On:</span>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {new Date(order.createdAt).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true
                                            })}
                                        </span>
                                    </div>

                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                                                <th className="px-3 py-2">Product Name</th>
                                                <th className="px-3 py-2">Qty</th>
                                                <th className="px-3 py-2">Price</th>
                                                <th className="px-3 py-2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.productsData.map((item) => (
                                                <tr key={item._id} className="border-b border-gray-200 dark:border-gray-700 text-sm">
                                                    <td className="px-3 py-2">{item?.productId?.name || "N/A"}</td>
                                                    <td className="px-3 py-2">{item?.productQuantity}</td>
                                                    <td className="px-3 py-2">&#8377;{(item?.productPrice)?.toFixed(2)}</td>
                                                    <td className="px-3 py-2">
                                                        &#8377;{(item.productPrice * item.productQuantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-between text-sm pt-4 text-gray-700 dark:text-gray-300">
                                    <p className="flex items-center gap-1">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Status:</span>
                                        <span>{order.status}</span>
                                    </p>

                                    <p className="flex items-center gap-1">
                                        <span className="font-semibold text-teal-600 dark:text-teal-400">Payment Mode:</span>
                                        <span>{order.paymentMode}</span>
                                    </p>

                                    <p className="flex items-center gap-1 font-semibold text-gray-800 dark:text-white">
                                        <span>Total Amount:</span>
                                        <span>&#8377;{order.totalAmount}</span>
                                    </p>
                                </div>
                            </div>
                        )))
                }
            </div>
        </div>
    )
}