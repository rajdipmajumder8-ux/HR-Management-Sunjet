import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { 
  uploadKYCDocument, 
  getKYCDocumentsByEmployee 
} from '../../services/kycService';
import { KYCDocument, KYCDocumentType } from '../../types';

export const KYCUploadPage: React.FC = () => {
  const { employee, refreshProfile } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [docType, setDocType] = useState<KYCDocumentType>('Aadhaar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<KYCDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const documentTypes: KYCDocumentType[] = [
    'Aadhaar',
    'PAN',
    'Bank document',
    'Address proof',
    'Other',
  ];

  const fetchDocs = async () => {
    if (!employee) return;
    try {
      setLoading(true);
      const docs = await getKYCDocumentsByEmployee(employee.uid);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error fetching KYC documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [employee]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !employee) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setUploading(true);

    try {
      await uploadKYCDocument(
        selectedFile,
        employee.uid,
        employee.employeeId,
        employee.fullName,
        docType
      );
      setSuccessMessage(`${docType} document uploaded successfully for HR review.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchDocs();
      await refreshProfile();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            KYC Document Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload identity, tax, and banking records for organizational verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Overall KYC Status:</span>
          <Badge type="kyc" value={employee.kycStatus} />
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Upload New Document</h2>
        <p className="text-xs text-slate-500 mb-6">
          Accepted file types: PDF, PNG, JPG, JPEG (Max 10MB)
        </p>

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Document Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {documentTypes.map((type) => {
                const isSelected = docType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attach File *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  selectedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {selectedFile ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Drag and drop your file here, or <span className="text-indigo-600 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports high-resolution scans, images, or official PDF copies
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Uploading to Storage...' : `Submit ${docType} for KYC`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Your Submitted KYC Documents</h2>
            <p className="text-xs text-slate-400">Track review progress and verification notices</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching your KYC documents..." />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No KYC documents uploaded yet"
            description="Submit your Aadhaar, PAN, or Bank document above to ensure compliance."
          />
        ) : (
          <div className="space-y-4">
            {documents.map((docItem) => (
              <div
                key={docItem.id}
                className={`p-5 rounded-2xl border transition-all ${
                  docItem.status === 'rejected'
                    ? 'border-rose-200 bg-rose-50/30'
                    : docItem.status === 'verified'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{docItem.documentType}</span>
                        <Badge type="docStatus" value={docItem.status} />
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{docItem.fileName}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Uploaded on {new Date(docItem.uploadedAt).toLocaleDateString()} at{' '}
                        {new Date(docItem.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {docItem.fileUrl && (
                      <button
                        onClick={() => setPreviewDoc(docItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Notice Banner if rejected */}
                {docItem.status === 'rejected' && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-800 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">HR Rejection Reason:</strong>
                        <p className="mt-0.5 leading-relaxed">
                          {docItem.rejectionReason || 'Document unreadable or invalid credentials provided. Please re-upload.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {docItem.status === 'verified' && docItem.verifiedBy && (
                  <p className="mt-2 text-[11px] text-emerald-700 font-medium">
                    ✓ Verified by {docItem.verifiedBy} on {new Date(docItem.verifiedAt || '').toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.documentType}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
              <span>File: {previewDoc.fileName}</span>
              <Badge type="docStatus" value={previewDoc.status} />
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto border border-slate-200">
              {previewDoc.fileUrl.startsWith('data:image') || 
               previewDoc.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[450px] object-contain rounded-xl shadow-xs"
                />
              ) : previewDoc.fileUrl.startsWith('data:application/pdf') || 
                  previewDoc.fileName.endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Preview"
                  className="w-full h-[450px] rounded-xl border-none"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-semibold">{previewDoc.fileName}</p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
