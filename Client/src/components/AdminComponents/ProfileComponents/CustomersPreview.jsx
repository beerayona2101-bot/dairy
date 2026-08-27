import React, { useContext, useEffect, useState } from "react";
import { EyeIcon, MessageCircleMore, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarContext } from "../../../context/SidebarProvider";
import { filterCustomers } from "../../../utils/filterCustomers.js";
import { fetchCustomers } from "../../../services/adminService.js";
import { Dialog, Slide, Avatar } from "@mui/material";
import { useSnackbar } from "notistack";
import { socket } from "../../../socket/socket.js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function CustomersList() {

  const { navbarInput } = useContext(SidebarContext);
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const res = await fetchCustomers();
        setCustomers(res?.customers ?? []);
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message || "Failed to load customers:", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    getCustomers();
  }, [enqueueSnackbar]);

  useEffect(() => {
    const handleNotificationStatus = ({ success, message }) => {
      setMessageLoading(false);

      if (success) {
        enqueueSnackbar(message || "Message sent successfully.", { variant: "success" });
        setOpen(false);
        setSelectedUser(null);
        setMessage("");
      } else {
        enqueueSnackbar(message || "Failed to send message.", { variant: "error" });
      }
    };

    socket.on("admin:send-message-status", handleNotificationStatus);

    return () => {
      socket.off("admin:send-message-status", handleNotificationStatus);
    };
  }, [enqueueSnackbar]);

  const handleMessageSend = () => {
    if (!selectedUser?._id || !message?.trim()) {
      enqueueSnackbar("Please select a user and write a message.", { variant: "error" });
      return;
    }

    if (message.length > 100) {
      enqueueSnackbar("Message should not exceed 100 characters.", { variant: "error" });
      return;
    }

    setMessageLoading(true);

    const payload = {
      userId: selectedUser._id,
      title: "New Message from Admin",
      description: message.trim(),
      date: new Date().toISOString(),
    };

    socket.emit("admin:send-message-to-user", payload);
  };

  const filteredCustomers = filterCustomers(customers, navbarInput);
  const visibleCustomers = filteredCustomers?.slice(0, visibleCount) ?? [];

  let componentContent;

  if (loading) {
    componentContent = (
      <p colSpan="6" className="text-center py-4 text-gray-500">
        Loading...
      </p>
    );
  } else if (!visibleCustomers || visibleCustomers.length === 0) {
    componentContent = (
      <p colSpan="6" className="text-center py-4 text-gray-500">
        No customers found.
      </p>
    );
  } else {
    componentContent = <table className="min-w-[750px] w-full text-sm text-left">
      <thead>
        <tr className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
          <th className="px-3 py-2">Name</th>
          <th className="px-3 py-2">Phone</th>
          <th className="px-3 py-2">Email</th>
          <th className="px-3 py-2">Gender</th>
          <th className="px-3 py-2">Orders</th>
          <th className="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {visibleCustomers.map((cust) => (
          <tr
            key={cust?._id}
            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30"
          >
            <td className="px-3 py-2 font-medium text-purple-600 whitespace-nowrap max-w-50 line-clamp-1 dark:text-purple-400">
              {cust?.firstName ?? ""} {cust?.lastName ?? ""}
            </td>
            <td className="px-3 py-2">{cust?.mobileNo ?? "N/A"}</td>
            <td className="px-3 py-2">{cust?.email ?? "N/A"}</td>
            <td className="px-3 py-2">{cust?.gender ?? "-"}</td>
            <td className="px-3 py-2 font-semibold text-gray-800 dark:text-white">
              {cust?.orders?.length ?? 0}
            </td>
            <td className="px-3 py-2 flex items-center flex-nowrap gap-2">
              <button
                onClick={() => {
                  setSelectedUser(cust);
                  setOpen(true);
                }}
                disabled={messageLoading}
                className={`flex items-center gap-1 text-sm text-green-600 hover:underline 
    ${messageLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `}
              >
                {messageLoading && selectedUser?._id === cust?._id ? (
                  <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MessageCircleMore size={16} />
                )}
                Message
              </button>

              <Link
                to={`/admin/store/${cust?._id}/orders-history`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                <EyeIcon size={16} /> View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-500/20 p-5 rounded shadow-sm space-y-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">👥 Customers</h2>
          <Link
            to="/admin/store"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          {componentContent}
        </div>

        {visibleCount < filteredCustomers?.length && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="text-sm text-purple-600 hover:underline flex items-center gap-1"
            >
              <Plus size={18} /> Load More
            </button>
          </div>
        )}
      </div>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          if (!messageLoading) {
            setOpen(false);
            setSelectedUser(null);
          }
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: 24,
              borderRadius: 1,
            },
          },
        }}
      >
        <div className="bg-white dark:text-white dark:bg-black/80 p-3 w-[90vw] max-w-md rounded shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <Avatar alt={selectedUser?.firstName} src={selectedUser?.photo} className="w-14 h-14" />
            <div>
              <h2 className="text-lg font-semibold">{selectedUser?.firstName} {selectedUser?.lastName}</h2>
              <p className="text-sm text-gray-500">{selectedUser?.email}</p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              maxLength={100}
              disabled={messageLoading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed"
              placeholder="Write your message..."
            ></textarea>
            <div className="text-right text-xs text-gray-500 mt-1">{message.length}/100</div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                setOpen(false);
                setSelectedUser(null);
              }}
              disabled={messageLoading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:text-gray-800 rounded text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleMessageSend}
              disabled={messageLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {messageLoading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Submit
            </button>
          </div>

        </div>
      </Dialog >
    </>
  );
}
