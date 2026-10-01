import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPageContentService } from "../services/pageContentService";
import wsManager from "../socket/WebSocketManager";

export const PageContentContext = createContext();

const defaultInitialContent = {
  companyName: "MADHU Dairy And Daily Needs",
  companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
  companyDescription:
    "MADHU Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
  heroBannerImage: "/assets/hero_carousel_slide_1.png",
  heroCarouselSlides: [
    {
      image: "/assets/hero_carousel_slide_1.png",
      title: "Welcome to MADHU Dairy & Daily Needs",
      subtitle: "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms.",
      buttonText: "Explore Products",
      buttonLink: "/products",
    },
    {
      image: "/assets/hero_carousel_slide_2.png",
      title: "100% Pure, Organic & Farm-Fresh A2 Milk",
      subtitle: "Delivered fresh to your doorstep every morning with zero preservatives and pristine hygiene.",
      buttonText: "Order Fresh Milk",
      buttonLink: "/products",
    },
    {
      image: "/assets/hero_carousel_slide_3.png",
      title: "Traditional Ghee, Artisanal Paneer & Delicacies",
      subtitle: "Crafted with pure whole milk and traditional recipes for authentic nutrition, rich aroma and taste.",
      buttonText: "Shop Dairy Products",
      buttonLink: "/products",
    },
  ],
  landingHeroImage: "/assets/landing_hero_bg_hd.png",
  goodnessOfferings: [],
  landingCategories: [],
  faqs: [],
};

export const PageContentProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [localPageContent, setLocalPageContent] = useState(null);

  const { data: queryPageContent, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['pageContent'],
    queryFn: async () => {
      const data = await getPageContentService();
      if (data?.success && data?.pageContent) {
        return data.pageContent;
      }
      return defaultInitialContent;
    },
    staleTime: 0,           // Always considered stale — refetch always fetches fresh from server
    gcTime: 1000 * 60 * 5, // Keep in memory for 5 min (was 1 hour — reduce memory pressure)
    refetchOnWindowFocus: false,
  });

  const pageContent = localPageContent ?? queryPageContent ?? defaultInitialContent;
  const loading = queryLoading && !pageContent;

  const setPageContent = useCallback((updater) => {
    setLocalPageContent((prev) => {
      const current = prev ?? queryPageContent ?? defaultInitialContent;
      const next = typeof updater === 'function' ? updater(current) : updater;
      queryClient.setQueryData(['pageContent'], next);
      return next;
    });
  }, [queryPageContent, queryClient]);

  useEffect(() => {
    const handleUpdated = (data) => {
      const updated = data?.pageContent || data;
      if (updated) {
        setPageContent(updated);
      }
    };

    const unsubs = [
      wsManager.subscribe("page-content:updated", handleUpdated),
      wsManager.subscribe("page_content.updated", handleUpdated),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [setPageContent]);

  const value = useMemo(
    () => ({
      pageContent,
      setPageContent,
      loading,
      refreshPageContent: refetch,
    }),
    [pageContent, loading, refetch]
  );

  return (
    <PageContentContext.Provider value={value}>
      {children}
    </PageContentContext.Provider>
  );
};
