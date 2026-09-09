import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { getPageContentService } from "../services/pageContentService";
import wsManager from "../socket/WebSocketManager";

export const PageContentContext = createContext();

export const PageContentProvider = ({ children }) => {
  const [pageContent, setPageContent] = useState({
    companyName: "MADHU Dairy And Daily Needs",
    companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
    companyDescription:
      "MADHU Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
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
