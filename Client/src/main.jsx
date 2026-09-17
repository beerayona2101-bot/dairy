import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { AuthProvider } from "./context/AuthProvider.jsx"
import { ProductProvider } from './context/ProductProvider.jsx'
import { CartProvider } from './context/CartProvider.jsx'
import UserOrderProvider from './context/UserOrderProvider.jsx';
import { PageContentProvider } from './context/PageContentProvider.jsx';
import { WebSocketProvider } from './context/WebSocketProvider.jsx';
import { NavigationProvider } from './context/NavigationProvider.jsx';

// Create TanStack Query client with instant-loading cache policies
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Load FontAwesome asynchronously so it doesn't block the initial paint
const faLink = document.createElement('link');
faLink.rel = 'stylesheet';
faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
faLink.crossOrigin = 'anonymous';
document.head.appendChild(faLink);

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '199361032805-op5jfh1l5ribcj08elgt9gg10i0u56ao.apps.googleusercontent.com'}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NavigationProvider>
              <WebSocketProvider>
                <ProductProvider>
                  <PageContentProvider>
                    <ThemeProvider>
                      <CartProvider>
                        <UserOrderProvider>
                          <App />
                        </UserOrderProvider>
                      </CartProvider>
                    </ThemeProvider>
                  </PageContentProvider>
                </ProductProvider>
              </WebSocketProvider>
            </NavigationProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
)
