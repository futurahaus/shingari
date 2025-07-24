import React from "react";

export const OrdersDetailSkeleton: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center py-8">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-0 animate-pulse">
      <div className="text-center pt-8 pb-4">
        <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-2"></div>
      </div>
      <div className="px-8">
        <div className="border-t border-gray-200">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8 px-8">
        <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
                <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-8 px-8">
        <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 px-8">
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="flex items-center gap-2 p-3 border rounded-xl bg-gray-50">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl mt-2 md:mt-0" />
      </div>
    </div>
  </div>
); 