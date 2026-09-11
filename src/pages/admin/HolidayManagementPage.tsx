import React, { useState, useEffect } from 'react';
import { 
  Palmtree, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  getAllHolidays, 
  addHoliday, 
  deleteHoliday, 
  seedInitialHolidays 
} from '../../services/holidayService';
import { Holiday, HolidayType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const HolidayManagementPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  // Add holiday modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<HolidayType>('mandatory');
  const [description, setDescription] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenAddModal = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('mandatory');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setActionLoading(true);
    setFeedback(null);

    // Compute day of week from date
    const d = new Date(date);
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });

    try {
      await addHoliday({
        title: title.trim(),
        date,
        dayOfWeek,
        type,
        description: description.trim(),
      });
      setFeedback({ type: 'success', message: `Added "${title}" to the company holiday calendar.` });
      setIsModalOpen(false);
      await fetchHolidays();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add holiday.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (!window.confirm(`Are you sure you want to remove "${holiday.title}" from company holidays?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteHoliday(holiday.id);
      setFeedback({ type: 'success', message: `Removed "${holiday.title}".` });
      await fetchHolidays();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete holiday.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setActionLoading(true);
    try {
      await seedInitialHolidays();
      setFeedback({ type: 'success', message: 'Loaded standard corporate holidays to Firestore.' });
      await fetchHolidays();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to seed holidays.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Company Holiday Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure company-wide days off, public holidays, and floating observances
          </p>
        </div>

        <div className="flex items-center gap-2">
          {holidays.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Seed Defaults</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Holidays Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Fetching holiday calendar..." />
        ) : holidays.length === 0 ? (
          <EmptyState
            icon={Palmtree}
            title="No holidays scheduled"
            description="Create your company's holiday calendar or import standard official holidays."
            action={
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
              >
                Import Default Holidays
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Holiday Name</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Day</th>
                  <th className="pb-3 px-3">Classification</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-900">
                      {holiday.title}
                    </td>
                    <td className="py-4 px-3 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {holiday.date}
                    </td>
                    <td className="py-4 px-3 text-slate-600">
                      {holiday.dayOfWeek}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge type="holiday" value={holiday.type} />
                    </td>
                    <td className="py-4 px-3 text-slate-500 max-w-sm truncate">
                      {holiday.description || 'Full office closure'}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(holiday)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Company Holiday"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Holiday Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Independence Day, Winter Break"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Holiday Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Holiday Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as HolidayType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="mandatory">Mandatory Holiday</option>
                <option value="optional">Optional Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description / Guidelines
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official office closure, floating optional day"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !title || !date}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Add to Calendar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
