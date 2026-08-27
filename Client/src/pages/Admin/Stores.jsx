import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { 
  getAllStores, 
  createCustomerApi, 
  updateCustomerApi, 
  deleteCustomerApi 
} from "../../services/storeServices";
import { SidebarContext } from "../../context/SidebarProvider";
import BuffaloLoader from "../../components/BuffaloLoader";
import { filterStoresByInput } from "../../utils/filterStores";
import { useSnackbar } from "notistack";

export default function Stores() {
    const { enqueueSnackbar } = useSnackbar();
    const { navbarInput } = useContext(SidebarContext);
    const [debouncedInput] = useDebounce(navbarInput, 300);

    const [totalStores, setTotalStores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        gender: "Male",
        password: ""
    });

    const handleGetAllStores = async () => {
        try {
            setLoading(true);
            const data = await getAllStores();
            if (data?.success) {
                setTotalStores(data.stores);
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Error fetching customer stores", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetAllStores();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.email) {
            enqueueSnackbar("First Name and Email are required.", { variant: "warning" });
            return;
        }

        try {
            setActionLoading(true);
            const res = await createCustomerApi(formData);
            if (res?.success) {
                const msg = res?.message || "User created successfully and login credentials have been sent to the registered email.";
                enqueueSnackbar(msg, { variant: "success" });
                setOpenAddModal(false);
                setFormData({ firstName: "", lastName: "", email: "", mobileNo: "", gender: "Male", password: "" });
                await handleGetAllStores();
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Failed to create user account.", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditCustomer = async (e) => {
        e.preventDefault();
        if (!selectedStore?._id) return;

        try {
            setActionLoading(true);
            const res = await updateCustomerApi(selectedStore._id, formData);
            if (res?.success) {
                enqueueSnackbar("Customer details updated successfully!", { variant: "success" });
                setOpenEditModal(false);
                await handleGetAllStores();
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Failed to update customer.", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCustomer = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this customer account?")) return;

        try {
            const res = await deleteCustomerApi(userId);
            if (res?.success) {
                enqueueSnackbar("Customer account deleted successfully.", { variant: "info" });
                setTotalStores((prev) => prev.filter((s) => s._id !== userId));
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || "Failed to delete customer.", { variant: "error" });
        }
    };

    const openEditDialog = (store) => {
        setSelectedStore(store);
        setFormData({
            firstName: store.firstName || "",
            lastName: store.lastName || "",
            email: store.email || "",
            mobileNo: store.mobileNo || "",
            gender: store.gender || "Male",
            password: ""
        });
        setOpenEditModal(true);
    };

    const filteredStores = filterStoresByInput(totalStores, debouncedInput);

    const companyName = "Madhur Dairy & Daily Needs";
    const address = "Shed no. A-31, Datri Mala, Ambad, MIDC Ambad, Nashik, Maharashtra 422010";
    const appLink = "http://localhost:5173";

    if (loading) {
        return <BuffaloLoader variant="inline" text="Loading Customers..." />;
    }

    return (
        <div className="p-3">
            <div className="bg-white dark:bg-gray-500/20 rounded-lg p-4 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Accounts Management</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-300">View, add, edit, or manage all customer profiles and send welcome emails.</p>
                    </div>

                    <button
                        onClick={() => {
                            setFormData({ firstName: "", lastName: "", email: "", mobileNo: "", gender: "Male", password: "" });
                            setOpenAddModal(true);
                        }}
                        className="flex items-center gap-2 bg-[#1E88E5] hover:bg-[#6e305e] text-white px-4 py-2 rounded-md shadow font-medium transition"
                    >
                        <PersonAddIcon fontSize="small" />
                        Add Customer
                    </button>
                </div>

                <div className="space-y-6">
                    {filteredStores?.length > 0 ? (
                        filteredStores.map((store) => (
                            <div
                                key={store._id}
                                className="md:flex items-start bg-gray-50 dark:bg-gray-500/10 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {store?.photo ? (
                                    <img
                                        src={store.photo}
                                        alt={store.firstName}
                                        loading="lazy"
                                        className="h-44 w-full md:h-64 md:w-56 object-cover"
                                    />
                                ) : (
                                    <div className="h-44 w-full md:h-64 md:w-56 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                        <EmojiFoodBeverageIcon className="text-gray-500 dark:text-gray-300 text-5xl" />
                                    </div>
                                )}

                                <div className="flex-1 flex flex-col justify-between p-4 space-y-2 text-gray-800 dark:text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{store.firstName} {store.lastName}</h3>
                                            <p className="text-xs text-[#1E88E5] dark:text-pink-400 font-semibold">{store.username ? `@${store.username}` : "Customer Account"}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditDialog(store)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                                                title="Edit Customer"
                                            >
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(store._id)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                                                title="Delete Customer"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p>
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">Email:</span>{" "}
                                            <a
                                                href={`mailto:${store.email}`}
                                                className="text-[#1E88E5] dark:text-sky-400 hover:underline font-medium transition"
                                                title={`Send Email to ${store.email}`}
                                            >
                                                {store.email}
                                            </a>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">Mobile:</span>{" "}
                                            {store.mobileNo ? (
                                                <a
                                                    href={`tel:${store.mobileNo}`}
                                                    className="text-[#1E88E5] dark:text-sky-400 hover:underline font-medium transition"
                                                    title={`Call ${store.mobileNo}`}
                                                >
                                                    {store.mobileNo}
                                                </a>
                                            ) : (
                                                "N/A"
                                            )}
                                        </p>
                                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Gender:</span> {store.gender || "N/A"}</p>
                                        <p><span className="font-semibold text-gray-500 dark:text-gray-400">Total Orders:</span> <span className="font-bold text-green-600 dark:text-green-400">{store.orders?.length || 0}</span></p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            to={`/admin/customers/${store?._id}/orders-history`}
                                            className="flex items-center gap-1 text-sm bg-[#1E88E5] text-white px-3 py-1.5 rounded-md shadow hover:bg-[#6c2f5c] transition"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                            View Orders History ({store.orders?.length || 0})
                                        </Link>

                                        <a
                                            href={`https://wa.me/91${store?.mobileNo || "9490644434"}?text=${encodeURIComponent(
                                                `Hello ${store.firstName}, I'm contacting you from *${companyName}*.\nApp: ${appLink}\nMessage: `
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md shadow hover:bg-green-700 transition text-sm"
                                            title="Message on WhatsApp"
                                        >
                                            <WhatsAppIcon fontSize="small" />
                                            <span>WhatsApp Customer</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-300 text-lg">
                            {navbarInput?.trim() ? (
                                <>No customers found matching <span className="font-semibold">"{navbarInput}"</span>.</>
                            ) : (
                                "No customer accounts registered."
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD CUSTOMER MODAL */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-[#1E88E5]">➕ Add New Customer</DialogTitle>
                <form onSubmit={handleAddCustomer}>
                    <DialogContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    placeholder="Rahul"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    placeholder="Sharma"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="customer@gmail.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                    placeholder="9490644434"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1">Initial Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="Password123"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className="p-4">
                        <button type="button" onClick={() => setOpenAddModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-[#1E88E5] text-white text-sm font-semibold rounded hover:bg-[#6c2f5c]">
                            {actionLoading ? "Creating..." : "Create & Send Welcome Email"}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* EDIT CUSTOMER MODAL */}
            <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-[#1E88E5]">✏️ Edit Customer Info</DialogTitle>
                <form onSubmit={handleEditCustomer}>
                    <DialogContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1">Mobile Number</label>
                            <input
                                type="text"
                                name="mobileNo"
                                value={formData.mobileNo}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className="p-4">
                        <button type="button" onClick={() => setOpenEditModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-[#1E88E5] text-white text-sm font-semibold rounded hover:bg-[#6c2f5c]">
                            {actionLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}