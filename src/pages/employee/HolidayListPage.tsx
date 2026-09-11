import React, { useState, useEffect } from 'react';
import { 
  Palmtree, 
  Calendar, 
  Sparkles, 
  Clock, 
  Filter 
} from 'lucide-react';
import { getAllHolidays } from '../../services/holidayService';
import { Holiday, HolidayType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const HolidayListPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const list = await getAllHolidays();
        setHolidays(list);
      } catch (err) {
        console.error('Error fetching holidays:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredHolidays = holidays.filter((h) => {
    if (filterType === 'mandatory') return h.type === 'mandatory';
    if (filterType === 'optional') return h.type === 'optional';
    if (filterType === 'upcoming') return h.date >= todayStr;
    return true;
  });

  const nextUpcoming = holidays.find((h) => h.date >= todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Holiday Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official mandatory corporate closures and optional floating cultural holidays
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({holidays.length})
          </button>
          <button
            onClick={() => setFilterType('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'upcoming'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterType('mandatory')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'mandatory'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mandatory
          </button>
          <button
            onClick={() => setFilterType('optional')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'optional'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Optional
          </button>
        </div>
      </div>

      {/* Next Upcoming Highlight Card */}
      {nextUpcoming && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-200 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                Next Upcoming Holiday
              </span>
              <h2 className="text-xl font-bold mt-0.5">{nextUpcoming.title}</h2>
              <p className="text-xs text-slate-300 mt-1">
                {nextUpcoming.date} • {nextUpcoming.dayOfWeek} ({nextUpcoming.description || 'Full office closure'})
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
              {nextUpcoming.type === 'mandatory' ? 'Mandatory Holiday' : 'Optional Holiday'}
            </span>
          </div>
        </div>
      )}

      {/* Holiday Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Fetching holiday calendar..." />
        ) : filteredHolidays.length === 0 ? (
          <EmptyState
            icon={Palmtree}
            title="No holidays found"
            description="No holidays match the selected filter category."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHolidays.map((holiday) => {
              const isPast = holiday.date < todayStr;
              return (
                <div
                  key={holiday.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isPast
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge type="holiday" value={holiday.type} />
                    {isPast && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Past
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{holiday.title}</h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {holiday.description || 'Company designated holiday.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-700 font-mono">
                      {holiday.date}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {holiday.dayOfWeek}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
