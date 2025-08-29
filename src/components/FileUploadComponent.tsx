import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Download,
  Visibility,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description
} from '@mui/icons-material';
import { 
  StorageService, 
  ALLOWED_IMAGE_TYPES, 
  ALLOWED_DOCUMENT_TYPES, 
  ALLOWED_MEDICAL_TYPES,
  FILE_SIZE_LIMITS,
  type UploadResult 
} from '../api/storage';
import { useFirebaseFeatures } from '../hooks/useFirebaseFeatures';

interface FileUploadComponentProps {
  uploadType: 'patient_document' | 'patient_avatar' | 'prescription' | 'clinic_logo' | 'medical_image';
  context: {
    patientId?: string;
    appointmentId?: string;
    clinicId?: string;
    category?: 'medical_records' | 'lab_results' | 'prescriptions' | 'insurance' | 'images';
  };
  maxFiles?: number;
  onUploadComplete?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
  existingFiles?: Array<{ name: string; url: string; size: number; uploadDate: string; }>;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  uploadType,
  context,
  maxFiles = 5,
  onUploadComplete,
  onError,
  existingFiles = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { storage, analytics } = useFirebaseFeatures();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

  // Get allowed file types and size limits based on upload type
  const getAllowedTypes = () => {
    switch (uploadType) {
      case 'patient_avatar':
      case 'clinic_logo':
      case 'medical_image':
        return ALLOWED_IMAGE_TYPES;
      case 'prescription':
        return ALLOWED_DOCUMENT_TYPES;
      case 'patient_document':
        return ALLOWED_MEDICAL_TYPES;
      default:
        return ALLOWED_MEDICAL_TYPES;
    }
  };

  const getMaxFileSize = () => {
    switch (uploadType) {
      case 'patient_avatar':
      case 'clinic_logo':
        return FILE_SIZE_LIMITS.IMAGE;
      case 'prescription':
      case 'patient_document':
        return FILE_SIZE_LIMITS.MEDICAL;
      case 'medical_image':
        return FILE_SIZE_LIMITS.IMAGE;
      default:
        return FILE_SIZE_LIMITS.DOCUMENT;
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = getAllowedTypes();
    const maxSize = getMaxFileSize();

    if (!StorageService.validateFileType(file, allowedTypes)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (!StorageService.validateFileSize(file, maxSize)) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`File ${index + 1}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      onError?.(validationErrors.join('\n'));
      return;
    }

    if (validFiles.length + existingFiles.length > maxFiles) {
      onError?.(` have more than ${maxFiles} files in total`);
      return;
    }

    uploadFiles(validFiles);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    const results: UploadResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Track upload start
        analytics.trackEvent('file_upload_started', {
          upload_type: uploadType,
          file_type: file.type,
          file_size: file.size
        });

        const result = await storage.uploadFile(file, uploadType, context);
        results.push(result);

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadResults(results);
      onUploadComplete?.(results);

      // Track successful upload
      analytics.trackEvent('file_upload_completed', {
        upload_type: uploadType,
        files_count: results.length,
        total_size: results.reduce((sum, r) => sum + r.size, 0)
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      
      // Track upload failure
      analytics.trackEvent('file_upload_failed', {
        upload_type: uploadType,
        error: errorMessage
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (filePath: string) => {
    try {
      await storage.deleteFile(filePath);
      
      // Remove from results
      setUploadResults(prev => prev.filter(r => r.fullPath !== filePath));
      
      analytics.trackEvent('file_deleted', {
        upload_type: uploadType,
        file_path: filePath
      });
    } catch (error) {
      onError?.('Failed to delete file');
    }
  };

  const handlePreview = (file: { url: string; name: string; contentType?: string }) => {
    setPreviewFile({
      url: file.url,
      name: file.name,
      type: file.contentType || 'application/octet-stream'
    });
  };

  const getFileIcon = (fileName: string, contentType?: string) => {
    const type = contentType || fileName.split('.').pop()?.toLowerCase();
    
    if (type?.includes('image')) return <Image />;
    if (type?.includes('pdf')) return <PictureAsPdf />;
    if (type?.includes('doc')) return <Description />;
    return <InsertDriveFile />;
  };

  return (
    <Box>
      {/* Upload Area */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {uploading ? 'Uploading...' : 'Click to upload files'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Max {maxFiles} files, up to {getMaxFileSize()}MB each
            </Typography>
            <Box sx={{ mt: 1 }}>
              {getAllowedTypes().map(type => (
                <Chip
                  key={type}
                  label={type.split('/')[1]?.toUpperCase() || type}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={getAllowedTypes().join(',')}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(uploadProgress)}% complete
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {(uploadResults.length > 0 || existingFiles.length > 0) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Files ({uploadResults.length + existingFiles.length})
            </Typography>
            
            <List>
              {/* Recently uploaded files */}
              {uploadResults.map((result, index) => (
                <ListItem key={`new-${index}`}>
                  {getFileIcon(result.fileName, result.contentType)}
                  <ListItemText
                    primary={result.fileName}
                    secondary={`${StorageService.formatFileSize(result.size)} • Just uploaded`}
                    sx={{ ml: 1 }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handlePreview({
                      url: result.url,
                      name: result.fileName,
                      contentType: result.contentType
                    })} size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      onClick={() => window.open(result.url, '_blank')}
                      size="small"
                    >
                      <Download />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(result.fullPath)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}

              {/* Existing files */}
              {existingFiles.map((file, index) => (
                <ListItem key={`existing-${index}`}>
                  {getFileIcon(file.name)}
                  <ListItemText
                    primary={file.name}
                    secondary={`${StorageService.formatFileSize(file.size)} • ${file.uploadDate}`}
                    sx={{ ml: 1 }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handlePreview(file)} size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      onClick={() => window.open(file.url, '_blank')}
                      size="small"
                    >
                      <Download />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewFile?.name}</DialogTitle>
        <DialogContent>
          {previewFile && (
            previewFile.type.includes('image') ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{ width: '100%', height: 'auto' }}
              />
            ) : previewFile.type.includes('pdf') ? (
              <iframe
                src={previewFile.url}
                width="100%"
                height="500px"
                title={previewFile.name}
              />
            ) : (
              <Typography>
                Preview not available for this file type. 
                <Button onClick={() => window.open(previewFile.url, '_blank')}>
                  Download to view
                </Button>
              </Typography>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
          <Button 
            onClick={() => previewFile && window.open(previewFile.url, '_blank')}
            variant="contained"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploadComponent; 