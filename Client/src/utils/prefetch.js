import { queryClient } from '../main';
import { getProducts } from '../services/productServices';
import { getPageContentService } from '../services/pageContentService';
import { getUserOrders } from '../services/orderService';

export const prefetchProducts = () => {
  queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await getProducts();
      return data?.success ? data.products : [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const prefetchPageContent = () => {
  queryClient.prefetchQuery({
    queryKey: ['pageContent'],
    queryFn: async () => {
      const data = await getPageContentService();
      return data?.success ? data.pageContent : null;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const prefetchUserOrders = (userId) => {
  if (!userId) return;
  queryClient.prefetchQuery({
    queryKey: ['userOrders', userId],
    queryFn: async () => {
      const res = await getUserOrders(userId);
      return res?.success ? res.orders : [];
    },
    staleTime: 1000 * 60 * 3,
  });
};
