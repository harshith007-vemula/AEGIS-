'use client';

import dynamic from 'next/dynamic';

const DashboardMap = dynamic(
  () => import('./DashboardMapInner'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-xl min-h-[350px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
        <p className="text-xs text-slate-400 mt-4 tracking-widest uppercase">Initializing Geospatial Overlays...</p>
      </div>
    )
  }
);

export default DashboardMap;
