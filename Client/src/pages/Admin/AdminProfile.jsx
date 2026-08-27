import React from 'react';

import AdminProfileInfo from '../../components/AdminComponents/ProfileComponents/AdminProfileInfo';
import OrdersPreview from '../../components/AdminComponents/ProfileComponents/OrdersPreview';
import CustomersPreview from '../../components/AdminComponents/ProfileComponents/CustomersPreview';

export default function AdminProfile() {

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-gray-500/20 rounded-sm min-h-screen m-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-3xl font-bold ms-2">Admin Profile</h1>
      </div>

      <AdminProfileInfo />

      <div className="gap-4 flex flex-wrap md:flex-nowrap">
        <div className='space-y-4 flex-1 overflow-hidden'>
          <OrdersPreview />
          <CustomersPreview />
        </div>
      </div>
    </div>
  );
}
