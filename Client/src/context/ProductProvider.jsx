import { useMemo, useState, createContext, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { getProducts } from "../services/productServices";
import wsManager from "../socket/WebSocketManager";

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
        const newProduct = data?.newProduct || data;
        if (newProduct && newProduct._id) {
            setProducts((prev) => [...prev.filter(p => p._id !== newProduct._id), newProduct]);
        }
    }, []);

    const handleRemoveProduct = useCallback((data) => {
        const deletedProduct = data?.deletedProduct || data;

        if (deletedProduct && deletedProduct._id) {
            setProducts((prevProducts) =>
                prevProducts.filter((product) => String(product._id) !== String(deletedProduct._id))
            );
        }
    }, []);

    const handleUpdateProduct = useCallback((data) => {
        const updatedProduct = data?.updatedProduct || data;

        if (updatedProduct && updatedProduct._id) {
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    String(product._id) === String(updatedProduct._id) ? updatedProduct : product
                )
            );
        }
    }, []);

    useEffect(() => {
        const unsubs = [
            wsManager.subscribe("product-stock-update", updateProducts),
            wsManager.subscribe("add-new-product:success", handleAddNewProduct),
            wsManager.subscribe("product.created", handleAddNewProduct),
            wsManager.subscribe("remove-product:success", handleRemoveProduct),
            wsManager.subscribe("product.deleted", handleRemoveProduct),
            wsManager.subscribe("update-product:success", handleUpdateProduct),
            wsManager.subscribe("product.updated", handleUpdateProduct),
        ];

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
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
