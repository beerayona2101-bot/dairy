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
  heroBannerImage: "/assets/home_welcome_hero_bg.png",
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
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
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
