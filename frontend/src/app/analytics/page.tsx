'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, PieChart, TrendingUp, ShieldCheck, HeartPulse, HardHat 
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '@/lib/api';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AnalyticsPage() {
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
      return;
    }
    
    Promise.all([
      api.resources.list(),
      api.incidents.list()
    ]).then(([resData, incData]) => {
      setResources(resData);
      setIncidents(incData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // 1. Resource Chart Data
  const resourceChartData = {
    labels: resources.map(r => r.name),
    datasets: [
      {
        label: 'Quantity Available',
        data: resources.map(r => r.quantity),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // 2. Incident Category Distribution
  // Count by matching keywords in description
  const categoryCounts = { Flood: 0, Wildfire: 0, Earthquake: 0, Medical: 0 };
  incidents.forEach(inc => {
    const desc = inc.description.toLowerCase();
    const tit = inc.title.toLowerCase();
    if (desc.includes('flood') || desc.includes('water') || tit.includes('flood')) {
      categoryCounts.Flood++;
    } else if (desc.includes('fire') || desc.includes('smoke') || tit.includes('fire')) {
      categoryCounts.Wildfire++;
    } else if (desc.includes('earthquake') || desc.includes('seismic') || tit.includes('seismic')) {
      categoryCounts.Earthquake++;
    } else {
      categoryCounts.Medical++;
    }
  });

  const doughnutData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(14, 165, 233, 0.6)', // Sky Blue
          'rgba(249, 115, 22, 0.6)',  // Orange
          'rgba(234, 179, 8, 0.6)',   // Yellow
          'rgba(16, 185, 129, 0.6)',  // Emerald
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  // 3. Simulated Trend over the week
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Threat Alerts Triggered',
        data: [2, 5, 3, 8, 4, 12, incidents.length],
        fill: true,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit' }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
      }
    }
  };

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">ANALYTICS & REPORTS</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Macro Threat Visualizations</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Cards info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-xl border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">System Security status</span>
              <span className="text-sm font-bold text-slate-200 block mt-0.5">CYBER THREAT PROTECTED</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-lg text-sky-500">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">Regional Triage Status</span>
              <span className="text-sm font-bold text-slate-200 block mt-0.5">ICU OCCUPANCY NORMAL</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-indigo-500">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">FEMA Coordinator Sync</span>
              <span className="text-sm font-bold text-slate-200 block mt-0.5">LOCAL API BRIDGES SECURE</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployed Resource Stocks */}
          <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <BarChart className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Resource Logistics Availability</h3>
            </div>
            <div className="h-[250px] relative">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase tracking-widest font-mono">Compiling logs...</div>
              ) : (
                <Bar data={resourceChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Incidents Categories Distribution */}
          <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Incident Category Allocations</h3>
            </div>
            <div className="h-[250px] relative flex justify-center">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase tracking-widest font-mono">Mapping sectors...</div>
              ) : (
                <div className="w-[280px]">
                  <Doughnut data={doughnutData} options={{
                    ...chartOptions,
                    maintainAspectRatio: true
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Line Chart: Weekly Trigger Trends */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-xl border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <TrendingUp className="w-4 h-4 text-red-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Disaster Alert Frequencies (Weekly Trends)</h3>
            </div>
            <div className="h-[250px] relative">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs uppercase tracking-widest font-mono">Analyzing trends...</div>
              ) : (
                <Line data={lineData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
