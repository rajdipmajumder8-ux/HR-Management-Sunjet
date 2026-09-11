import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  FileCheck, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllKYCDocuments, verifyKYCDocument, rejectKYCDocument } from '../../services/kycService';
import { KYCDocument } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const KYCVerificationPage: React.FC = () => {
  const { employee: currentAdmin } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<KYCDocument | null>(null);

  // Reject modal
  const [rejectingDoc, setRejectingDoc] = useState<KYCDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const list = await getAllKYCDocuments();
      setDocuments(list);
    } catch (err) {
      console.error('Error fetching KYC documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleVerify = async (docItem: KYCDocument) => {
    if (!currentAdmin) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await verifyKYCDocument(docItem.id, docItem.employeeUid, currentAdmin.fullName);
      setFeedback({ type: 'success', message: `${docItem.documentType} for ${docItem.employeeName} verified successfully.` });
      await fetchDocuments();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to verify document.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !rejectingDoc || !rejectionReason.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await rejectKYCDocument(
        rejectingDoc.id,
        rejectingDoc.employeeUid,
        rejectionReason.trim(),
        currentAdmin.fullName
      );
      setFeedback({ 
        type: 'success', 
        message: `${rejectingDoc.documentType} for ${rejectingDoc.employeeName} was marked as rejected with reason.` 
      });
      setRejectingDoc(null);
      setRejectionReason('');
      await fetchDocuments();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject document.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocs = documents.filter((docItem) => {
    if (statusFilter === 'all') return true;
    return docItem.status === statusFilter;
  });

  const pendingCount = documents.filter((d) => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            KYC Document Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted Aadhaar, PAN, Bank documents, and address proofs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'pending'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'verified'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({documents.length})
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
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Verification Queue Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Loading submitted KYC documents..." />
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title={statusFilter === 'pending' ? 'No pending KYC documents' : 'No documents found'}
            description={
              statusFilter === 'pending'
                ? 'All submitted employee KYC documents have been reviewed and processed.'
                : 'No documents match the active filter status.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Employee</th>
                  <th className="pb-3 px-3">Document Type</th>
                  <th className="pb-3 px-3">File Name</th>
                  <th className="pb-3 px-3">Submitted At</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.map((docItem) => (
                  <tr key={docItem.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-900 block">{docItem.employeeName}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {docItem.employeeId}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {docItem.documentType}
                    </td>
                    <td className="py-4 px-3 text-slate-600 font-mono max-w-xs truncate">
                      {docItem.fileName}
                    </td>
                    <td className="py-4 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(docItem.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge type="docStatus" value={docItem.status} />
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(docItem)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                        >
                          Inspect
                        </button>

                        {docItem.status !== 'verified' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleVerify(docItem)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {docItem.status !== 'rejected' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => setRejectingDoc(docItem)}
                            className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingDoc && (
        <Modal
          isOpen={Boolean(rejectingDoc)}
          onClose={() => setRejectingDoc(null)}
          title={`Reject ${rejectingDoc.documentType} (${rejectingDoc.employeeName})`}
          maxWidth="md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-800 text-xs">
              <span className="font-semibold block">Mandatory Rejection Notice:</span>
              Please explain why this KYC document is being rejected (e.g. illegible scan, name mismatch, expired document).
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify the reason so the employee can re-upload..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDoc(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Document'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`${previewDoc.documentType} - ${previewDoc.employeeName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <div>
                <span className="font-bold text-slate-800">{previewDoc.employeeName}</span> ({previewDoc.employeeId})
              </div>
              <Badge type="docStatus" value={previewDoc.status} />
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto border border-slate-200">
              {previewDoc.fileUrl.startsWith('data:image') || previewDoc.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[450px] object-contain rounded-xl"
                />
              ) : (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Preview"
                  className="w-full h-[450px] rounded-xl border-none"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {previewDoc.status !== 'verified' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      const docToVerify = previewDoc;
                      setPreviewDoc(null);
                      handleVerify(docToVerify);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Verify & Approve
                  </button>
                )}
                {previewDoc.status !== 'rejected' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      const docToReject = previewDoc;
                      setPreviewDoc(null);
                      setRejectingDoc(docToReject);
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Reject with Reason
                  </button>
                )}
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
