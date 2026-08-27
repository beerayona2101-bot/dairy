import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { getPageContentService } from "../services/pageContentService";
import { socket } from "../socket/socket";

export const PageContentContext = createContext();

export const PageContentProvider = ({ children }) => {
  const [pageContent, setPageContent] = useState({
    companyName: "Madhur Dairy And Daily Needs",
    companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
    companyDescription:
      "Madhur Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
    heroBannerImage: "/assets/home_welcome_hero_bg.png",
    landingHeroImage: "/assets/landing_hero_bg_hd.png",
    goodnessOfferings: [],
    landingCategories: [],
    faqs: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const data = await getPageContentService();
      if (data?.success && data?.pageContent) {
        setPageContent(data.pageContent);
      }
    } catch (err) {
      console.warn("Failed to load dynamic page content:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    const handleUpdated = (data) => {
      if (data?.pageContent) {
        setPageContent(data.pageContent);
      }
    };

    socket.on("page-content:updated", handleUpdated);

    return () => {
      socket.off("page-content:updated", handleUpdated);
    };
  }, [fetchContent]);

  const value = useMemo(
    () => ({
      pageContent,
      setPageContent,
      loading,
      refreshPageContent: fetchContent,
    }),
    [pageContent, loading, fetchContent]
  );

  return (
    <PageContentContext.Provider value={value}>
      {children}
    </PageContentContext.Provider>
  );
};
