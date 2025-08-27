import React, { useState, useRef } from 'react';
import './FileUpload.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FileUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const requiredExtensions = ['.shp', '.dbf', '.shx', '.prj'];
  const optionalExtensions = ['.cpg', '.sbn', '.sbx'];
  const allExtensions = [...requiredExtensions, ...optionalExtensions];

  const handleFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allExtensions.includes(extension);
    });

    if (validFiles.length === 0) {
      setUploadMessage('Please select valid shapefile components (.shp, .dbf, .shx, .prj, etc.)');
      return;
    }

    setFiles(validFiles);
    setUploadMessage('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const validateFiles = () => {
    const extensions = files.map(file => '.' + file.name.split('.').pop().toLowerCase());
    const missingRequired = requiredExtensions.filter(ext => !extensions.includes(ext));
    
    if (missingRequired.length > 0) {
      return `Missing required files: ${missingRequired.join(', ')}`;
    }
    
    return null;
  };

  const uploadFiles = async () => {
    const validationError = validateFiles();
    if (validationError) {
      setUploadMessage(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage('Uploading and processing files...');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 50; // Upload is 50% of total progress
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadProgress(75);
          setUploadMessage('Processing shapefile data...');
          
          setTimeout(() => {
            const response = JSON.parse(xhr.responseText);
            setUploadProgress(100);
            if (response.success) {
              setUploadMessage(`Success! Processed ${response.data.processedCount} villages.`);
            } else {
              setUploadMessage(`Processing completed with issues: ${response.message}`);
            }
            
            setTimeout(() => {
              onUploadSuccess();
            }, 1000);
          }, 1000);
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploadMessage(`Upload failed: ${error.message}`);
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setUploadMessage('Upload failed: Network error');
        setUploading(false);
      });

      xhr.open('POST', `${API_BASE_URL}/upload/shapefile`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('Upload failed: ' + error.message);
      setUploading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <h3>Upload Shapefile Components</h3>
        <p>Drag and drop your shapefile components here, or click to select files</p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allExtensions.join(',')}
          onChange={handleFileSelect}
          className="file-input"
        />
        
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="browse-button"
          disabled={uploading}
        >
          Browse Files
        </button>
        
        <div className="file-requirements">
          <h4>Required Files:</h4>
          <ul>
            {requiredExtensions.map(ext => (
              <li key={ext} className="required">{ext}</li>
            ))}
          </ul>
          <h4>Optional Files:</h4>
          <ul>
            {optionalExtensions.map(ext => (
              <li key={ext} className="optional">{ext}</li>
            ))}
          </ul>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Selected Files ({files.length})</h4>
            <button onClick={clearFiles} className="clear-files-button" disabled={uploading}>
              Clear All
            </button>
          </div>
          
          <div className="files">
            {files.map((file, index) => {
              const extension = '.' + file.name.split('.').pop().toLowerCase();
              const isRequired = requiredExtensions.includes(extension);
              
              return (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className={`file-type ${isRequired ? 'required' : 'optional'}`}>
                      {isRequired ? 'Required' : 'Optional'}
                    </span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-file-button"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="upload-button"
          >
            {uploading ? 'Processing...' : 'Upload & Process Files'}
          </button>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{uploadProgress.toFixed(0)}%</div>
        </div>
      )}

      {uploadMessage && (
        <div className={`upload-message ${uploadMessage.includes('Success') ? 'success' : 
                         uploadMessage.includes('failed') || uploadMessage.includes('Missing') ? 'error' : 'info'}`}>
          {uploadMessage}
        </div>
      )}
    </div>
  );
};

export default FileUpload;