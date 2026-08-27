import { useMemo, useState, createContext, useEffect, useCallback } from "react";
import { getProducts } from "../services/productServices";
import { socket } from "../socket/socket";
import PropTypes from "prop-types"
import { enqueueSnackbar } from "notistack";
export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {

    const [filter, setFilter] = useState("Sort By");
    const [showHeaderExtras, setShowHeaderExtras] = useState(false);
    const [products, setProducts] = useState([]);
    const [productLoading, setProductLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                if (data?.success) {
                    setProducts(data.products);
                }
            } catch (error) {
                enqueueSnackbar(error?.response?.data?.message || "Error fetching products", { variant: "error" });
            } finally {
                setProductLoading(false);
            }
        }

        fetchProducts();
    }, []);

    const updateProducts = useCallback(({ updatedData }) => {

        const updateMap = new Map();
        updatedData?.forEach((u) => {
            updateMap?.set(u?.productId, u?.change);
        });

        setProducts((prevProducts) =>
            prevProducts?.map((product) => {
                const change = updateMap?.get(product?._id);

                if (change !== undefined) {
                    
                    const updatedStock = Math.max(product?.stock + change, 0);
                    const updatedSoldQuantity = product?.totalQuantitySold + (-1 * change)
                    
                    return {
                        ...product,
                        stock: updatedStock,
                        totalQuantitySold: updatedSoldQuantity
                    };
                }
                return product;
            })
        );
    }, []);

    const handleAddNewProduct = useCallback((data) => {
        const { newProduct } = data;
        setProducts((prev) => [...prev, newProduct]);
    }, []);

    const handleRemoveProduct = useCallback((data) => {
        const { deletedProduct } = data;

        setProducts((prevProducts) =>
            prevProducts.filter((product) => product._id !== deletedProduct._id)
        );
    }, []);

    const handleUpdateProduct = useCallback((data) => {
        const { updatedProduct } = data;

        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product._id === updatedProduct._id ? updatedProduct : product
            )
        );
    }, []);

    useEffect(() => {
        socket.on("product-stock-update", updateProducts);
        socket.on("add-new-product:success", handleAddNewProduct);
        socket.on("remove-product:success", handleRemoveProduct);
        socket.on("update-product:success", handleUpdateProduct);

        return () => {
            socket.off("product-stock-update", updateProducts);
            socket.off("add-new-product:success", handleAddNewProduct);
            socket.off("remove-product:success", handleRemoveProduct);
            socket.off("update-product:success", handleUpdateProduct);
        }
    }, [updateProducts,
        handleAddNewProduct,
        handleRemoveProduct,
        handleUpdateProduct
    ]);

    const contextValue = useMemo(() => ({
        filter,
        showHeaderExtras,
        products,
        productLoading,
        setFilter,
        setShowHeaderExtras,
        setProducts,
        setProductLoading
    }), [filter, showHeaderExtras, products, productLoading]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    )
}

ProductProvider.propTypes = {
    children: PropTypes.node.isRequired
};  