import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertTriangle, Check, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeads } from '@/hooks/useLeads';
import { useToast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/database';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  notes: string;
}

interface DuplicateInfo {
  row: ParsedRow;
  existingLead: { id: string; name: string; email?: string; phone?: string };
  matchType: 'email' | 'phone';
}

const leadFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

export function BulkUploadModal({ open, onOpenChange }: BulkUploadModalProps) {
  const { leads, createLead } = useLeads();
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    email: '',
    phone: '',
    city: '',
    source: '',
    notes: '',
  });
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importProgress, setImportProgress] = useState(0);

  const parseCSV = (file: File): Promise<{ data: ParsedRow[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          resolve({ data: results.data as ParsedRow[], headers });
        },
        error: reject,
      });
    });
  };

  const parseExcel = (file: File): Promise<{ data: ParsedRow[]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: '' });
          const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
          resolve({ data: jsonData, headers });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      let result: { data: ParsedRow[]; headers: string[] };

      if (extension === 'csv') {
        result = await parseCSV(file);
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        result = await parseExcel(file);
      } else {
        toast({
          title: 'Unsupported file format',
          description: 'Please upload a CSV or Excel file.',
          variant: 'destructive',
        });
        return;
      }

      setParsedData(result.data);
      setHeaders(result.headers);
      
      // Auto-map columns based on header names
      const autoMapping: ColumnMapping = {
        name: '',
        email: '',
        phone: '',
        city: '',
        source: '',
        notes: '',
      };
      
      result.headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') && !autoMapping.name) autoMapping.name = header;
        if (lowerHeader.includes('email') && !autoMapping.email) autoMapping.email = header;
        if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('tel')) {
          if (!autoMapping.phone) autoMapping.phone = header;
        }
        if (lowerHeader.includes('city') || lowerHeader.includes('location')) {
          if (!autoMapping.city) autoMapping.city = header;
        }
        if (lowerHeader.includes('source') || lowerHeader.includes('channel')) {
          if (!autoMapping.source) autoMapping.source = header;
        }
        if (lowerHeader.includes('note') || lowerHeader.includes('comment') || lowerHeader.includes('remark')) {
          if (!autoMapping.notes) autoMapping.notes = header;
        }
      });
      
      setColumnMapping(autoMapping);
      setStep('mapping');
    } catch (error) {
      toast({
        title: 'Error parsing file',
        description: 'Could not read the file. Please check the format.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const checkDuplicates = () => {
    const found: DuplicateInfo[] = [];
    
    parsedData.forEach((row) => {
      const rowEmail = row[columnMapping.email]?.toLowerCase().trim();
      const rowPhone = row[columnMapping.phone]?.trim();
      
      const existingByEmail = rowEmail ? leads.find(
        (lead) => lead.email?.toLowerCase().trim() === rowEmail
      ) : null;
      
      const existingByPhone = rowPhone ? leads.find(
        (lead) => lead.phone?.trim() === rowPhone
      ) : null;
      
      if (existingByEmail) {
        found.push({
          row,
          existingLead: existingByEmail,
          matchType: 'email',
        });
      } else if (existingByPhone) {
        found.push({
          row,
          existingLead: existingByPhone,
          matchType: 'phone',
        });
      }
    });
    
    setDuplicates(found);
  };

  const handleProceedToPreview = () => {
    if (!columnMapping.name) {
      toast({
        title: 'Name field required',
        description: 'Please map the Name field before proceeding.',
        variant: 'destructive',
      });
      return;
    }
    checkDuplicates();
    setStep('preview');
  };

  const getLeadsToImport = () => {
    if (skipDuplicates) {
      const duplicateRows = new Set(duplicates.map((d) => d.row));
      return parsedData.filter((row) => !duplicateRows.has(row));
    }
    return parsedData;
  };

  const handleImport = async () => {
    const leadsToImport = getLeadsToImport();
    setStep('importing');
    setImportProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < leadsToImport.length; i++) {
      const row = leadsToImport[i];
      try {
        await createLead.mutateAsync({
          name: row[columnMapping.name] || 'Unknown',
          email: row[columnMapping.email] || null,
          phone: row[columnMapping.phone] || null,
          city: row[columnMapping.city] || null,
          source: row[columnMapping.source] || null,
          notes: row[columnMapping.notes] || null,
          status: 'new' as LeadStatus,
          assigned_to: null,
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
      setImportProgress(Math.round(((i + 1) / leadsToImport.length) * 100));
    }

    toast({
      title: 'Import complete',
      description: `Successfully imported ${successCount} leads${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
    });

    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setParsedData([]);
    setHeaders([]);
    setFileName('');
    setColumnMapping({
      name: '',
      email: '',
      phone: '',
      city: '',
      source: '',
      notes: '',
    });
    setDuplicates([]);
    setImportProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Bulk Upload Leads
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-muted-foreground mb-4">or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{fileName}</span>
              <Badge variant="secondary">{parsedData.length} rows</Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Map columns to lead fields</h3>
              <div className="grid grid-cols-2 gap-4">
                {leadFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </label>
                    <Select
                      value={columnMapping[field.key as keyof ColumnMapping]}
                      onValueChange={(v) => setColumnMapping({ ...columnMapping, [field.key]: v })}
                    >
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="">-- Not mapped --</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleProceedToPreview} className="bg-gradient-neon text-primary-foreground">
                Preview Import
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {duplicates.length > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 space-y-3">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{duplicates.length} potential duplicates found</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  These leads match existing records by email or phone number.
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant={skipDuplicates ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSkipDuplicates(true)}
                  >
                    Skip duplicates
                  </Button>
                  <Button
                    variant={!skipDuplicates ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSkipDuplicates(false)}
                  >
                    Import anyway
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Preview ({getLeadsToImport().length} leads to import)
              </h3>
            </div>

            <ScrollArea className="flex-1 border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">City</th>
                    <th className="p-3 text-left">Source</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((row, idx) => {
                    const isDuplicate = duplicates.some((d) => d.row === row);
                    const willSkip = isDuplicate && skipDuplicates;
                    
                    return (
                      <tr
                        key={idx}
                        className={cn(
                          'border-t border-border',
                          willSkip && 'opacity-50 bg-destructive/5'
                        )}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {row[columnMapping.name] || '-'}
                            {isDuplicate && (
                              <Badge variant="outline" className="text-warning border-warning text-xs">
                                Duplicate
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{row[columnMapping.email] || '-'}</td>
                        <td className="p-3">{row[columnMapping.phone] || '-'}</td>
                        <td className="p-3">{row[columnMapping.city] || '-'}</td>
                        <td className="p-3">{row[columnMapping.source] || '-'}</td>
                        <td className="p-3">
                          {willSkip ? (
                            <Badge variant="outline" className="text-muted-foreground">Skipped</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">New</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <p className="p-3 text-center text-muted-foreground text-sm">
                  Showing first 50 of {parsedData.length} rows
                </p>
              )}
            </ScrollArea>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Back
              </Button>
              <Button onClick={handleImport} className="bg-gradient-neon text-primary-foreground">
                <Check className="w-4 h-4 mr-2" />
                Import {getLeadsToImport().length} Leads
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium mb-2">Importing leads...</p>
              <p className="text-muted-foreground">{importProgress}% complete</p>
            </div>
            <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-neon transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
