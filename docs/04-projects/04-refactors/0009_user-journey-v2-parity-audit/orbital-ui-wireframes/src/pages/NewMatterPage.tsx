import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft } from
'lucide-react';
import { Page } from '../hooks/useOrbitalState';
interface NewMatterPageProps {
  onCreate: (name: string) => void;
  onNavigate?: (page: Page) => void;
}
export function NewMatterPage({ onCreate, onNavigate }: NewMatterPageProps) {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFiles([...files, 'contract_v1.pdf', 'addendum_a.pdf']);
  };
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back + Header */}
      <div className="mb-8">
        {onNavigate &&
        <button
          onClick={() => onNavigate('matters')}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">

            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Matters
          </button>
        }
        <h1 className="font-serif font-semibold text-3xl text-foreground mb-2">
          New Matter
        </h1>
        <p className="text-muted-foreground">
          Upload documents to begin a new review project.
        </p>
      </div>

      <div className="space-y-8">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Matter Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Acme Corp v. GlobalTech Industries"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />

        </div>

        {/* Upload Dropzone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Documents
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() =>
            setFiles([...files, `document_${files.length + 1}.pdf`])
            }
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40'}`}>

            <div className="w-12 h-12 bg-card rounded-full shadow-sm flex items-center justify-center mb-4 border border-purple-200">
              <UploadCloud className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Click or drag PDF files here to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, DOCX (Max 50MB per file)
            </p>
          </div>
        </div>

        {/* Ingest Rows */}
        {files.length > 0 &&
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-ui-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ingest Queue
              </h3>
              <span className="text-xs text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-border">
              {files.map((file, i) =>
            <div
              key={i}
              className="px-4 py-3 flex items-center justify-between">

                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-muted-foreground mr-3" />
                    <span className="text-sm font-medium text-foreground">
                      {file}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-muted-foreground">
                      12 pages
                    </span>
                    <span className="flex items-center text-xs text-success font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Ready
                    </span>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        {/* Required Docs Checklist */}
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-900 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Required Documentation
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center text-sm">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${files.length > 0 ? 'bg-success/10 border-success/30 text-success' : 'border-orange-300 bg-white'}`}>

                {files.length > 0 && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <span
                className={
                files.length > 0 ?
                'text-orange-900 line-through opacity-50' :
                'text-orange-800'
                }>

                Main Agreement
              </span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-4 h-4 rounded-full border border-orange-300 bg-white mr-3" />
              <span className="text-orange-800">Amendments (Optional)</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-4 h-4 rounded-full border border-orange-300 bg-white mr-3" />
              <span className="text-orange-800">
                Schedules & Exhibits (Optional)
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          {onNavigate ?
          <button
            onClick={() => onNavigate('matters')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">

              Cancel
            </button> :

          <div />
          }
          <button
            onClick={() => name && files.length > 0 && onCreate(name)}
            disabled={!name || files.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">

            Create Matter
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>);

}