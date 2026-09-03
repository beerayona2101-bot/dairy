import { useState, useRef, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CompareIcon from "@mui/icons-material/Compare";
import ShareIcon from "@mui/icons-material/Share";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ProductContext } from "../../context/ProductProvider";
import { CartContext } from "../../context/CartProvider";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { addToWishlist, removeProductFromWishList } from "../../services/userProfileService";

import { products as fallbackProducts } from "../../data/products";
import { getProductImage, getDiscountedPrice } from "../../utils/helper";
import { formatNumberWithCommas } from "../../utils/format";
import { useSnackbar } from "notistack";
import { getGuestWishlist, toggleGuestWishlist } from "../../utils/guestWishlist";

// High quality transparent cow cutout illustration fallback
const COW_ILLUSTRATION = "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969548/madhur_dairy_products/tpk19n9emretjunded8t.jpg";

// Smart AI Nutritional & Health Profile Generator
export const generateAiNutritionalProfile = (title) => {
    const lower = (title || "").toLowerCase();
    
    if (lower.includes("cream")) {
        return [
            { label: "Milk Fat & Creaminess", percent: 96, val: "40% Pure Milk Fat", color: "#6C5CE7" },
            { label: "Energy & Calories", percent: 92, val: "340 kcal / 100g", color: "#F59E0B" },
            { label: "Calcium & Minerals", percent: 85, val: "95mg Calcium", color: "#00ACC1" },
            { label: "Natural Protein", percent: 78, val: "2.1g Protein", color: "#00B894" },
            { label: "Customer Approval", percent: 98, val: "4.9★ Whipping Grade", color: "#FF7675" }
        ];
    } else if (lower.includes("paneer")) {
        return [
            { label: "Protein Content", percent: 98, val: "18.3g / 100g", color: "#00B894" },
            { label: "Calcium Level", percent: 94, val: "480mg DV", color: "#00ACC1" },
            { label: "Healthy Dairy Fat", percent: 90, val: "20.8% A2 Fat", color: "#6C5CE7" },
            { label: "Sugar Content", percent: 99, val: "0.2g Low Sugar", color: "#F59E0B" },
            { label: "Customer Approval", percent: 97, val: "4.9★ Verified", color: "#FF7675" }
        ];
    } else if (lower.includes("ghee")) {
        return [
            { label: "Pure Healthy Fat", percent: 99, val: "99.7% A2 Ghee", color: "#6C5CE7" },
            { label: "Energy Boost", percent: 96, val: "897 kcal/100g", color: "#F59E0B" },
            { label: "Vitamin A & E", percent: 94, val: "Rich Antioxidants", color: "#00B894" },
            { label: "Lactose & Sugar", percent: 100, val: "0% Lactose Free", color: "#00ACC1" },
            { label: "Customer Approval", percent: 98, val: "5.0★ Rating", color: "#FF7675" }
        ];
    } else if (lower.includes("curd") || lower.includes("dahi")) {
        return [
            { label: "Probiotics & Gut Health", percent: 97, val: "Live Cultures", color: "#00B894" },
            { label: "Protein Content", percent: 90, val: "4.2g / 100g", color: "#00ACC1" },
            { label: "Calcium Level", percent: 93, val: "150mg DV", color: "#6C5CE7" },
            { label: "Natural Sugar", percent: 86, val: "3.2g Natural", color: "#F59E0B" },
            { label: "Customer Approval", percent: 95, val: "4.8★ Choice", color: "#FF7675" }
        ];
    } else if (lower.includes("butter")) {
        return [
            { label: "Pure Dairy Fat", percent: 97, val: "82% Milk Fat", color: "#6C5CE7" },
            { label: "Vitamin A & D", percent: 92, val: "Essential Vitamins", color: "#F59E0B" },
            { label: "Natural Moisture", percent: 88, val: "16% Natural Water", color: "#00ACC1" },
            { label: "Sodium / Salt", percent: 84, val: "1.2% Balanced Salt", color: "#00B894" },
            { label: "Customer Approval", percent: 96, val: "4.9★ Creamy", color: "#FF7675" }
        ];
    } else if (lower.includes("lassi") || lower.includes("chaas") || lower.includes("buttermilk")) {
        return [
            { label: "Hydration & Coolant", percent: 96, val: "Natural Coolant", color: "#00ACC1" },
            { label: "Probiotics", percent: 92, val: "Active Cultures", color: "#00B894" },
            { label: "Protein Content", percent: 85, val: "2.8g / 100ml", color: "#6C5CE7" },
            { label: "Sugar Content", percent: 84, val: "Balanced Taste", color: "#F59E0B" },
            { label: "Customer Approval", percent: 94, val: "4.8★ Refreshing", color: "#FF7675" }
        ];
    } else if (lower.includes("sweet") || lower.includes("ped") || lower.includes("jamun") || lower.includes("rasgulla") || lower.includes("shrikhand") || lower.includes("basundi")) {
        return [
            { label: "Rich Milk Solids", percent: 94, val: "100% Pure Khoya", color: "#6C5CE7" },
            { label: "Natural Energy", percent: 90, val: "Instant Energy", color: "#F59E0B" },
            { label: "Calcium & Minerals", percent: 88, val: "Dairy Minerals", color: "#00B894" },
            { label: "Sweetness Balance", percent: 92, val: "Pure Cane Sugar", color: "#00ACC1" },
            { label: "Customer Approval", percent: 99, val: "5.0★ Traditional", color: "#FF7675" }
        ];
    } else {
        return [
            { label: "Protein Content", percent: 92, val: "3.4g / 100ml", color: "#00B894" },
            { label: "Calcium & Minerals", percent: 95, val: "120mg DV", color: "#00ACC1" },
            { label: "Healthy Milk Fat", percent: 88, val: "3.8% Pure Fat", color: "#6C5CE7" },
            { label: "Natural Sugar Content", percent: 82, val: "4.7g Natural", color: "#F59E0B" },
            { label: "Customer Approval", percent: 96, val: "4.9★ Favorite", color: "#FF7675" }
        ];
    }
};

export const getNormalizedNutritionMetrics = (item, title) => {
    const defaultMetrics = generateAiNutritionalProfile(title);

    let rawMetrics = item?.nutritionMetrics || item?.nutrition?.nutritionMetrics;
    if (Array.isArray(rawMetrics) && rawMetrics.length > 0) {
        return rawMetrics.map((m, idx) => ({
            label: m.label || m.name || `Metric ${idx + 1}`,
            percent: Number(m.percent) || (92 - idx * 3),
            val: m.val || m.value || `${m.percent || 90}%`,
            color: m.color || (idx === 0 ? "#00B894" : idx === 1 ? "#00ACC1" : idx === 2 ? "#6C5CE7" : idx === 3 ? "#F59E0B" : "#FF7675")
        }));
    }

    if (Array.isArray(item?.nutrition) && item.nutrition.length > 0) {
        return item.nutrition.map((str, idx) => {
            const parts = String(str).split(":");
            const label = parts[0]?.trim() || "Nutrient";
            const val = parts[1]?.trim() || String(str);
            const defaultM = defaultMetrics[idx] || defaultMetrics[0];
            return {
                label: label,
                percent: defaultM.percent || (92 - idx * 3),
                val: val,
                color: defaultM.color || "#00B894"
            };
        });
    }

    return defaultMetrics;
};

// 3D Studio Product Bottle Render with Custom Labels & Liquid Themes
const MadhurStudioProductRender = ({ title, image, transparentUrl }) => {
    const lower = (title || "").toLowerCase();

    // Use user's exact uploaded studio image for Milk
    if (lower.includes("milk") && !lower.includes("badam") && !lower.includes("badham") && !lower.includes("flavor") && !lower.includes("powder")) {
        return (
            <img
                src={transparentUrl || image || "/assets/showcase/milk_hd.png"}
                alt={title}
                loading="lazy"
                decoding="async"
                className="max-h-[270px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-transform duration-200"
            />
        );
    }

    if (lower.includes("lassi")) {
        return (
            <img
                src={transparentUrl || image || "/assets/showcase/lassi_hd.png"}
                alt={title}
                loading="lazy"
                decoding="async"
                className="max-h-[270px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-transform duration-200"
            />
        );
    }

    if (lower.includes("chaas") || lower.includes("buttermilk")) {
        return (
            <img
                src={transparentUrl || image || "/assets/showcase/buttermilk_hd.png"}
                alt={title}
                loading="lazy"
                decoding="async"
                className="max-h-[270px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-transform duration-200"
            />
        );
    }

    if (lower.includes("ghee")) {
        return (
            <img
                src={transparentUrl || image || "/assets/showcase/ghee_hd.png"}
                alt={title}
                loading="lazy"
                decoding="async"
                className="max-h-[270px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-transform duration-200"
            />
        );
    }

    // Dynamic 3D Glass Bottle Render for Rabri, Khoya, Butter, Cream, Badam, Shrikhand, Sweets, etc.
    let liquidColor = "#FFFDF5"; // Cream default
    let subTitle = "Pure Dairy";

    if (lower.includes("rabri") || lower.includes("basundi")) {
        liquidColor = "#F5D061"; // Saffron Rabri
        subTitle = "Creamy Malai Rabri";
    } else if (lower.includes("badam") || lower.includes("badham")) {
        liquidColor = "#F3C06B"; // Saffron Almond
        subTitle = "Badam Milk";
    } else if (lower.includes("butter")) {
        liquidColor = "#F6E05E"; // Butter Yellow
        subTitle = "Cooking Butter";
    } else if (lower.includes("khoya") || lower.includes("mawa")) {
        liquidColor = "#FFFDF0";
        subTitle = "Pure Fresh Khoya";
    } else if (lower.includes("shrikhand")) {
        liquidColor = "#F6AD55";
        subTitle = "Kesar Shrikhand";
    } else if (lower.includes("cream")) {
        liquidColor = "#FFFFFF";
        subTitle = "Fresh Malai Cream";
    } else if (lower.includes("sweet") || lower.includes("mithai")) {
        liquidColor = "#EBF8FF";
        subTitle = "Dairy Sweets";
    } else if (lower.includes("curd") || lower.includes("dahi")) {
        liquidColor = "#FFFFFF";
        subTitle = "Pure Fresh Dahi";
    } else if (lower.includes("paneer") || lower.includes("cheese")) {
        liquidColor = "#FFFFFF";
        subTitle = "Fresh A2 Paneer";
    }

    const displayLabel = title || subTitle;

    return (
        <div className="relative flex items-center justify-center max-h-[270px] h-[270px] w-auto">
            <svg
                viewBox="0 0 200 420"
                className="h-full w-auto max-h-[260px] drop-shadow-[0_22px_28px_rgba(0,0,0,0.3)] filter"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={`glassGrad-${displayLabel.replace(/[^a-zA-Z]/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="20%" stopColor="#ffffff" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                        <stop offset="80%" stopColor="#ffffff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id={`liquidGrad-${displayLabel.replace(/[^a-zA-Z]/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={liquidColor} stopOpacity="1" />
                        <stop offset="100%" stopColor={liquidColor} stopOpacity="0.85" />
                    </linearGradient>

                    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1565C0" />
                        <stop offset="40%" stopColor="#1E88E5" />
                        <stop offset="70%" stopColor="#42A5F5" />
                        <stop offset="100%" stopColor="#0D47A1" />
                    </linearGradient>

                    <linearGradient id="labelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFDF9" />
                        <stop offset="100%" stopColor="#F5F0E6" />
                    </linearGradient>

                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.2" />
                    </filter>
                </defs>

                {/* Liquid Fill Inside Glass */}
                <path
                    d="M 68,60 L 132,60 C 142,60 148,80 152,110 L 154,370 C 154,395 130,405 100,405 C 70,405 46,395 46,370 L 48,110 C 52,80 58,60 68,60 Z"
                    fill={`url(#liquidGrad-${displayLabel.replace(/[^a-zA-Z]/g, '')})`}
                />

                {/* Outer Glass Contour */}
                <path
                    d="M 68,50 L 132,50 C 144,50 150,75 154,110 L 156,370 C 156,398 132,408 100,408 C 68,408 44,398 44,370 L 46,110 C 50,75 56,50 68,50 Z"
                    fill={`url(#glassGrad-${displayLabel.replace(/[^a-zA-Z]/g, '')})`}
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2"
                />

                {/* Metallic Blue Cap */}
                <rect x="64" y="32" width="72" height="22" rx="4" fill="url(#capGrad)" filter="url(#dropShadow)" />
                <rect x="66" y="34" width="68" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                <line x1="64" y1="46" x2="136" y2="46" stroke="#0D47A1" strokeWidth="1.5" />

                {/* Glass Reflection Highlight Stripe */}
                <path
                    d="M 52,120 Q 56,80 68,62 L 76,62 Q 64,80 60,120 L 58,360 Q 64,390 80,396 L 72,396 Q 54,390 50,360 Z"
                    fill="rgba(255, 255, 255, 0.45)"
                />

                {/* Condensation Droplets */}
                <circle cx="62" cy="140" r="2.5" fill="rgba(255,255,255,0.9)" />
                <circle cx="140" cy="160" r="3" fill="rgba(255,255,255,0.85)" />
                <circle cx="68" cy="210" r="3.5" fill="rgba(255,255,255,0.9)" />
                <circle cx="136" cy="270" r="2.5" fill="rgba(255,255,255,0.85)" />
                <circle cx="70" cy="320" r="3" fill="rgba(255,255,255,0.9)" />
                <circle cx="134" cy="350" r="2" fill="rgba(255,255,255,0.8)" />

                {/* Brand Cream Label with Gold & Blue Borders */}
                <g filter="url(#dropShadow)">
                    <rect x="47" y="175" width="106" height="155" rx="6" fill="url(#labelGrad)" stroke="#1E88E5" strokeWidth="2" />
                    <rect x="49" y="177" width="102" height="151" rx="4" fill="none" stroke="#D4AF37" strokeWidth="1" />

                    {/* Blue Arch */}
                    <path d="M 52,205 Q 100,185 148,205" fill="none" stroke="#1E88E5" strokeWidth="2.5" />

                    {/* MADHUR Header */}
                    <text x="100" y="222" textAnchor="middle" fill="#0F2742" fontFamily="serif" fontSize="18" fontWeight="900" letterSpacing="1">
                        MADHUR
                    </text>

                    {/* Dynamic Product Name */}
                    <text x="100" y="242" textAnchor="middle" fill="#1E88E5" fontFamily="sans-serif" fontSize="10" fontWeight="700">
                        {displayLabel.length > 18 ? displayLabel.substring(0, 16) + "..." : displayLabel}
                    </text>

                    {/* Cow Vector Art */}
                    <g transform="translate(74, 250) scale(0.45)">
                        <path d="M 20,10 C 15,5 5,10 5,20 C 5,30 20,35 30,30 C 40,35 55,30 55,20 C 55,10 45,5 40,10 Z" fill="#795548" />
                        <path d="M 25,12 C 22,8 12,12 12,20 C 12,28 25,32 30,28 Z" fill="#FFFFFF" />
                        <circle cx="22" cy="18" r="2" fill="#000" />
                        <circle cx="38" cy="18" r="2" fill="#000" />
                    </g>

                    {/* Badge */}
                    <line x1="57" y1="290" x2="143" y2="290" stroke="#D4AF37" strokeWidth="1" />
                    <text x="100" y="303" textAnchor="middle" fill="#0F2742" fontFamily="sans-serif" fontSize="8" fontWeight="800">
                        A2 FARM FRESH
                    </text>
                    <text x="100" y="316" textAnchor="middle" fill="#718096" fontFamily="sans-serif" fontSize="6.5" fontWeight="600">
                        100% PURE &amp; NATURAL
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default function ProductShowcase3D() {
    const { enqueueSnackbar } = useSnackbar();
    const productCtx = useContext(ProductContext);
    const cartCtx = useContext(CartContext);

    const realProducts = productCtx?.products && productCtx.products.length > 0 ? productCtx.products : [];
    const rawItems = realProducts.length > 0 ? realProducts : fallbackProducts;

    // Helper to return ultra HD 4K background-free Madhur brand studio cutouts
    const getIsolatedProductCutout = (title, originalImage) => {
        const lower = (title || "").toLowerCase();
        if (lower.includes("milk") && !lower.includes("powder") && !lower.includes("flavor") && !lower.includes("badam") && !lower.includes("badham")) return "/assets/showcase/milk_hd.png";
        if (lower.includes("curd") || lower.includes("dahi")) return "/assets/showcase/curd_hd.png";
        if (lower.includes("paneer")) return "/assets/showcase/paneer_hd.png";
        if (lower.includes("lassi")) return "/assets/showcase/lassi_hd.png";
        if (lower.includes("buttermilk") || lower.includes("chaas")) return "/assets/showcase/buttermilk_hd.png";
        if (lower.includes("ghee")) return "/assets/showcase/ghee_hd.png";
        if (lower.includes("butter")) return "/assets/showcase/butter_hd.png";
        if (lower.includes("khoya") || lower.includes("mawa")) return "/assets/showcase/khoya_hd.png";
        if (lower.includes("shrikhand")) return "/assets/showcase/shrikhand_hd.png";
        if (lower.includes("basundi")) return "/assets/showcase/shrikhand_hd.png";
        if (lower.includes("cheese")) return "/assets/showcase/cheese_hd.png";
        if (lower.includes("sweet") || lower.includes("mithai") || lower.includes("ped") || lower.includes("jamun") || lower.includes("rasgulla")) return "/assets/showcase/sweets_hd.png";
        if (lower.includes("cream")) return "/assets/showcase/cream_hd.png";
        if (lower.includes("badam") || lower.includes("badham")) return "/assets/showcase/badam_hd.png";
        if (lower.includes("powder")) return "/assets/showcase/milk_hd.png";
        return originalImage;
    };

    // Build showcase slides dynamically for all products available
    const showcaseSlides = rawItems.map((item, idx) => {
        const title = item.name || item.title || "Organic Dairy Product";
        const rawImg = getProductImage(item);
        const cutoutFromItem = item.pngImage || item.showcaseCutout;
        const image = (cutoutFromItem && typeof cutoutFromItem === "string" && cutoutFromItem.trim()) ? cutoutFromItem : getIsolatedProductCutout(title, rawImg);
        const rawPrice = Number(item.price) || 60;
        const rawDiscount = Number(item.discount) || (idx % 2 === 0 ? 15 : 10);
        const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
        const uniqueId = item._id || item.id || `slide-${idx}-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

        // Custom 5 Nutritional Metrics per Product set by Admin or AI
        const finalNutritionMetrics = getNormalizedNutritionMetrics(item, title);

        return {
            id: uniqueId,
            rawProduct: item,
            title: title,
            description: item.description || "Farm-fresh, 100% pure & natural A2 dairy product rich in essential calcium, vitamins, and minerals. Delivered daily to your doorstep.",
            price: `$${(discountedPrice > 0 ? discountedPrice : rawPrice).toFixed(2)}`,
            priceInr: `₹${formatNumberWithCommas(discountedPrice > 0 ? discountedPrice : rawPrice)}`,
            originalPrice: rawPrice,
            discount: rawDiscount,
            discountCode: idx % 2 === 0 ? "ORGANIC15" : "MADHUR20",
            image: image,
            rating: item.rating || (4.7 + (idx % 3) * 0.1).toFixed(1),
            reviewsCount: 120 + idx * 25,
            nutritionMetrics: finalNutritionMetrics,
            direction: item.direction || "Store at 4°C cold refrigeration. Shake well before use. Consume within 3-4 days of opening for peak fresh taste.",
            ingredients: item.ingredients || (item.features ? item.features.join(", ") : "100% Pure A2 Dairy Milk, Vitamin D3, Calcium, Natural Minerals, Zero Chemical Preservatives."),
            details: item.details || `Category: ${item.category || "Dairy"} | Net Vol: ${item.quantity || "1 Litre"} | 100% Grass-Fed Farm Sourced | Cold-Chain Quality Assured.`
        };
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
    const [isSaved, setIsSaved] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const [transparentImgMap, setTransparentImgMap] = useState({});
    const cardRef = useRef(null);

    // Touch Swipe State for Mobile
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const currentSlide = showcaseSlides[activeIndex] || showcaseSlides[0];

    // Dynamic Outer BFS Flood-Fill: Removes ONLY outer background pixels starting from edges, preserving 100% solid opacity for product text & graphics
    useEffect(() => {
        if (!currentSlide?.image) return;
        const imgUrl = currentSlide.image;
        if (transparentImgMap[imgUrl]) return;

        // Skip SVG or already Base64 PNGs if not cross-origin canvas convertible
        if (imgUrl.startsWith("data:image/png")) {
            setTransparentImgMap((prev) => ({ ...prev, [imgUrl]: imgUrl }));
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const width = img.width;
                const height = img.height;
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data;

                const visited = new Uint8Array(width * height);
                const queue = [];

                // Push all 4 border edges
                for (let x = 0; x < width; x++) {
                    queue.push(x, 0);
                    queue.push(x, height - 1);
                }
                for (let y = 0; y < height; y++) {
                    queue.push(0, y);
                    queue.push(width - 1, y);
                }

                while (queue.length > 0) {
                    const py = queue.pop();
                    const px = queue.pop();
                    const idx = py * width + px;

                    if (px < 0 || px >= width || py < 0 || py >= height || visited[idx]) continue;
                    visited[idx] = 1;

                    const pByte = idx * 4;
                    const r = data[pByte];
                    const g = data[pByte + 1];
                    const b = data[pByte + 2];

                    if (r > 200 && g > 200 && b > 200) {
                        data[pByte + 3] = 0; // Make outer background transparent

                        if (px > 0) queue.push(px - 1, py);
                        if (px < width - 1) queue.push(px + 1, py);
                        if (py > 0) queue.push(px, py - 1);
                        if (py < height - 1) queue.push(px, py + 1);
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                const transparentUrl = canvas.toDataURL("image/png");
                setTransparentImgMap((prev) => ({ ...prev, [imgUrl]: transparentUrl }));
            } catch (e) {
                // Fallback to original image if cross-origin or canvas restricted
            }
        };
    }, [currentSlide?.image, transparentImgMap]);

    // Fast Auto-play Carousel Timer (Slides to next item every 3s, pauses on hover)
    useEffect(() => {
        if (isHoveringCard || showcaseSlides.length <= 1) return;

        const timer = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % showcaseSlides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [isHoveringCard, showcaseSlides.length]);

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
    };

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % showcaseSlides.length);
    };

    // Mouse 3D tilt tracking
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const normX = (e.clientX - centerX) / (rect.width / 2);
        const normY = (e.clientY - centerY) / (rect.height / 2);

        setMousePos({
            x: Math.max(-1, Math.min(1, normX)),
            y: Math.max(-1, Math.min(1, normY)),
        });
    };

    const handleMouseEnter = () => setIsHoveringCard(true);
    const handleMouseLeave = () => {
        setIsHoveringCard(false);
        setMousePos({ x: 0, y: 0 });
    };

    // Mobile Swipe Handler
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (distance > 40) handleNext();
        else if (distance < -40) handlePrev();

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const { authUser, setAuthUser, setOpenLoginDialog } = useContext(UserAuthContext);
    const { authAdmin, setAuthAdmin } = useContext(AdminAuthContext);
    const { addToCart } = useContext(CartContext);
    const activeUser = authUser || authAdmin;
    const setCurUser = authUser ? setAuthUser : setAuthAdmin;

    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [guestWishlist, setGuestWishlist] = useState(getGuestWishlist);

    useEffect(() => {
        const updateGuest = () => setGuestWishlist(getGuestWishlist());
        window.addEventListener("guestWishlistUpdated", updateGuest);
        return () => window.removeEventListener("guestWishlistUpdated", updateGuest);
    }, []);

    const currentProductId = currentSlide?.rawProduct?._id || currentSlide?.id;
    const isWishlisted = activeUser?._id
        ? (Array.isArray(activeUser?.wishlistedProducts) && activeUser.wishlistedProducts.some(w => {
            if (!w) return false;
            const wId = typeof w === 'object' ? w._id || w.id : w;
            return String(wId) === String(currentProductId);
        }))
        : guestWishlist.map(String).includes(String(currentProductId));

    const handleToggleWishlist = async () => {
        if (!currentProductId) return;

        if (!activeUser?._id) {
            const { added } = toggleGuestWishlist(currentProductId);
            enqueueSnackbar(added ? `Added ${currentSlide.title} to Wishlist!` : `Removed ${currentSlide.title} from Wishlist!`, { variant: added ? "success" : "info" });
            return;
        }

        if (wishlistLoading) return;

        const wasWishlisted = isWishlisted;
        setCurUser((prev) => {
            if (!prev) return prev;
            const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
            const newList = wasWishlisted
                ? currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(currentProductId) : String(item) !== String(currentProductId)))
                : [...currentList, currentProductId];
            return { ...prev, wishlistedProducts: newList };
        });

        try {
            setWishlistLoading(true);
            if (wasWishlisted) {
                const data = await removeProductFromWishList(activeUser._id, currentProductId);
                if (data?.success) enqueueSnackbar("Removed from wishlist!", { variant: "info" });
            } else {
                const data = await addToWishlist(activeUser._id, currentProductId);
                if (data?.success) enqueueSnackbar("Product added to wishlist!", { variant: "success" });
            }
        } catch (error) {
            setCurUser((prev) => {
                if (!prev) return prev;
                const currentList = Array.isArray(prev.wishlistedProducts) ? prev.wishlistedProducts : [];
                const revertedList = wasWishlisted
                    ? [...currentList, currentProductId]
                    : currentList.filter(item => (typeof item === 'object' ? String(item._id) !== String(currentProductId) : String(item) !== String(currentProductId)));
                return { ...prev, wishlistedProducts: revertedList };
            });
            enqueueSnackbar(error?.response?.data?.message || "Failed to update wishlist.", { variant: "error" });
        } finally {
            setWishlistLoading(false);
        }
    };

    const handlePurchase = () => {
        const p = currentSlide?.rawProduct || currentSlide;
        const productId = p?._id || p?.id;
        if (!productId) {
            enqueueSnackbar("Product unavailable.", { variant: "error" });
            return;
        }

        const rawPrice = Number(p.price) || 60;
        const rawDiscount = Number(p.discount) || 0;
        const { discountedPrice } = getDiscountedPrice(rawPrice, rawDiscount);
        const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;

        if (addToCart) {
            addToCart(productId, 1, finalPrice);
            enqueueSnackbar(`Added ${currentSlide.title} to Cart!`, { variant: "success" });
        }
    };

    const handleShare = () => {
        const shareData = {
            title: currentSlide.title,
            text: `Check out ${currentSlide.title} on Madhur Dairy!`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            enqueueSnackbar("Product link copied to clipboard!", { variant: "info" });
        }
    };

    // Calculated 3D transforms for left visual card
    const rotateX = isHoveringCard ? -mousePos.y * 12 : 0;
    const rotateY = isHoveringCard ? mousePos.x * 14 : 0;
    const translateX = isHoveringCard ? mousePos.x * 16 : 0;
    const translateY = isHoveringCard ? mousePos.y * 12 : 0;

    return (
        <section className="w-full py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            {/* Outer Showcase Container */}
            <div className="relative rounded-[36px] bg-[#EFF1F5] dark:bg-gray-900/90 border border-white/80 dark:border-gray-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.06)] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
                {/* 2-Column Asymmetric Split Layout: 380px | 1fr */}
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-stretch">
                    
                    {/* COLUMN 1 — Left 3D Visual Card Panel with Action Buttons Below */}
                    <div className="flex flex-col justify-between gap-4">
                        <div
                            ref={cardRef}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{ perspective: "1200px" }}
                            className="w-full relative bg-white dark:bg-gray-800 rounded-[28px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.04)] flex flex-col items-center justify-between min-h-[380px] sm:min-h-[420px] transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden border border-gray-100 dark:border-gray-700 group/card"
                        >
                            {/* Previous Arrow Control (←) */}
                            <button
                                onClick={handlePrev}
                                title="Previous Item"
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md border border-gray-100 dark:border-gray-600 flex items-center justify-center text-[#6C5CE7] hover:scale-110 hover:bg-[#6C5CE7] hover:text-white transition-all cursor-pointer opacity-80 group-hover/card:opacity-100"
                            >
                                <ArrowBackIosNewIcon sx={{ fontSize: "0.9rem" }} />
                            </button>

                            {/* Next Arrow Control (→) */}
                            <button
                                onClick={handleNext}
                                title="Next Item"
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-md border border-gray-100 dark:border-gray-600 flex items-center justify-center text-[#6C5CE7] hover:scale-110 hover:bg-[#6C5CE7] hover:text-white transition-all cursor-pointer opacity-80 group-hover/card:opacity-100"
                            >
                                <ArrowForwardIosIcon sx={{ fontSize: "0.9rem" }} />
                            </button>

                            {/* Floating Wishlist Button [❤️] */}
                            <button
                                onClick={handleToggleWishlist}
                                disabled={wishlistLoading}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border ${
                                    isWishlisted
                                        ? "bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-[#FF385C] shadow-rose-500/20"
                                        : "bg-white dark:bg-gray-700 border-pink-100 text-gray-400 hover:text-[#FF385C]"
                                }`}
                            >
                                {wishlistLoading ? (
                                    <div className="w-4 h-4 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
                                ) : isWishlisted ? (
                                    <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_8px_rgba(255,56,92,0.7)] animate-pulse" sx={{ fontSize: "1.25rem" }} />
                                ) : (
                                    <FavoriteBorderIcon className="text-gray-400 hover:text-[#FF385C] transition-colors" sx={{ fontSize: "1.25rem" }} />
                                )}
                            </button>

                            {/* Center Stage 3D Circle & Floating Product Cutout */}
                            <div className="relative w-full flex-1 flex items-center justify-center py-6">
                                <div className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] rounded-full bg-[#6C5CE7] shadow-lg flex items-center justify-center transition-transform duration-500 opacity-95">
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#8075e5] opacity-80" />
                                </div>

                                {/* Central 3D Product Visual with Motion Slide Transitions */}
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={currentSlide.id}
                                        custom={direction}
                                        initial={{ opacity: 0, x: direction * 100, rotateY: direction * 25, scale: 0.85 }}
                                        animate={{
                                            opacity: 1,
                                            x: translateX,
                                            y: translateY,
                                            rotateX: rotateX,
                                            rotateY: rotateY,
                                            scale: 1,
                                            translateZ: 40,
                                        }}
                                        exit={{ opacity: 0, x: -direction * 100, rotateY: -direction * 25, scale: 0.85 }}
                                        transition={{
                                            duration: isHoveringCard ? 0.1 : 0.2,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                        style={{ transformStyle: "preserve-3d" }}
                                        className="absolute inset-0 flex items-center justify-center p-4 z-10"
                                    >
                                        <MadhurStudioProductRender
                                            title={currentSlide.title}
                                            image={currentSlide.image}
                                            transparentUrl={transparentImgMap[currentSlide.image]}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Action Buttons Row BELOW Image Card (Wishlist, Share, Add to Cart) */}
                        <div className="grid grid-cols-3 gap-3 w-full">
                            {/* 1. Wishlist Button */}
                            <button
                                onClick={handleToggleWishlist}
                                disabled={wishlistLoading}
                                className={`py-3 px-3 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-xs border hover:scale-[1.02] active:scale-95 ${
                                    isWishlisted
                                        ? "bg-rose-50 dark:bg-rose-950/80 border-[#FF385C] text-[#FF385C] shadow-rose-500/20"
                                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-[#718096] hover:bg-rose-50/50 hover:text-[#FF385C]"
                                }`}
                            >
                                {wishlistLoading ? (
                                    <div className="w-4 h-4 border-2 border-t-transparent border-[#FF385C] rounded-full animate-spin"></div>
                                ) : isWishlisted ? (
                                    <FavoriteIcon className="text-[#FF385C] fill-current drop-shadow-[0_0_8px_rgba(255,56,92,0.75)] animate-pulse" sx={{ fontSize: "1.25rem" }} />
                                ) : (
                                    <FavoriteBorderIcon sx={{ fontSize: "1.25rem" }} />
                                )}
                                <span className={`text-xs font-extrabold ${isWishlisted ? "text-[#FF385C]" : "text-[#718096]"}`}>Wishlist</span>
                            </button>

                            {/* 2. Share Button */}
                            <button
                                onClick={handleShare}
                                className="py-3 px-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#718096] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-xs hover:bg-gray-50 hover:text-[#6C5CE7] hover:scale-[1.02]"
                            >
                                <ShareIcon sx={{ fontSize: "1.2rem" }} />
                                <span className="text-xs font-bold">Share</span>
                            </button>

                            {/* 3. Add to Cart Button */}
                            <button
                                onClick={handlePurchase}
                                className="py-3 px-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_8px_20px_rgba(108,92,231,0.35)] hover:scale-[1.02] active:scale-95"
                            >
                                <AddIcon sx={{ fontSize: "1.3rem" }} />
                                <span className="text-xs font-extrabold tracking-tight text-center leading-tight">Add to Cart</span>
                            </button>
                        </div>
                    </div>

                    {/* COLUMN 2 — Center Information & Specifications Section */}
                    <div className="flex flex-col justify-between py-2 px-1 sm:px-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="space-y-4"
                            >
                                {/* Heading: Large bold title in Vibrant Purple (#6C5CE7, 44px, bold 900) */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: 0, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-[32px] sm:text-[40px] lg:text-[44px] font-[900] text-[#6C5CE7] leading-tight tracking-[-1px]"
                                >
                                    {currentSlide.title}
                                </motion.h1>

                                {/* Description: Subtitle paragraph in muted grey (#718096, 13px) */}
                                <motion.p
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-[#718096] dark:text-gray-300 text-[13px] leading-[1.6] max-w-xl"
                                >
                                    {currentSlide.description}
                                </motion.p>

                                {/* Price Row: Bold Price in Rupees ONLY */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex items-center gap-4 pt-1"
                                >
                                    <span className="text-[28px] sm:text-[32px] font-[900] text-[#6C5CE7] tracking-tight">
                                        {currentSlide.priceInr}
                                    </span>
                                </motion.div>

                                {/* Nutritional & Health Indicators Section (5 Key Metrics: Protein, Calcium, Fat, Sugar, Customer Approval) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                                    className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-[#2D3748] dark:text-white flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
                                            Nutritional & Health Profile
                                        </h3>
                                        <span className="text-[11px] font-bold text-[#718096] dark:text-gray-400">100% Organic A2 Dairy</span>
                                    </div>

                                    {/* 5 Nutritional Progress Bars */}
                                    <div className="space-y-2">
                                        {currentSlide.nutritionMetrics?.map((metric, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] font-extrabold">
                                                    <span className="text-[#2D3748] dark:text-gray-200">{metric.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">({metric.val})</span>
                                                        <span style={{ color: metric.color }}>{metric.percent}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200/80 dark:bg-gray-700/80 h-[5px] rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: `${metric.percent}%` }}
                                                        transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                                                        style={{ backgroundColor: metric.color }}
                                                        className="h-full rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
