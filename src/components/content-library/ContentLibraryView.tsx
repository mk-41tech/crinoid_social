import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LibraryAsset, 
  LibraryFolder, 
  AssetCategory, 
  SortField, 
  SortOrder 
} from './types';
import { contentLibraryDb } from '../../services/contentLibraryDatabase';
import { objectStorage } from '../../services/objectStorage';
import { AssetPreviewModal } from './AssetPreviewModal';
import { FolderModal } from './FolderModal';
import '../../styles/contentLibrary.css';
import { 
  Upload, 
  Search, 
  Folder as FolderIcon, 
  FolderPlus, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Download, 
  Edit2, 
  Trash2, 
  Tag, 
  FileText, 
  Play, 
  Sparkles, 
  Check, 
  X, 
  Grid, 
  List, 
  HardDrive, 
  Clock, 
  Layers,
  AlertCircle
} from 'lucide-react';

export const ContentLibraryView: React.FC = () => {
  const { currentBrand, currentUser, showToast } = useApp();

  // Database State
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Interaction State
  const [previewAsset, setPreviewAsset] = useState<LibraryAsset | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    loadLibraryData();
  }, [currentBrand?.id]);

  const loadLibraryData = () => {
    setIsLoading(true);
    try {
      const brandId = currentBrand?.id || 'brand-crinoid';
      const brandName = currentBrand?.name || 'Crinoid Social';
      const loadedFolders = contentLibraryDb.getFolders(brandId);
      const loadedAssets = contentLibraryDb.getAssets(brandId, brandName);

      setFolders(loadedFolders);
      setAssets(loadedAssets);
    } catch (err) {
      console.error('Failed to initialize content library', err);
      showToast('error', 'Failed to load Content Library assets.');
    } finally {
      setIsLoading(false);
    }
  };

  // Supported Categories Filter Configuration
  const categoriesList: { key: AssetCategory; label: string }[] = [
    { key: 'all', label: 'All Media' },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Videos' },
    { key: 'gif', label: 'GIFs' },
    { key: 'logo', label: 'Logos' },
    { key: 'brand_asset', label: 'Brand Assets' },
    { key: 'campaign_creative', label: 'Campaign Creatives' },
    { key: 'other', label: 'Other' }
  ];

  // Distinct tags collected from all assets
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach(a => a.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [assets]);

  // Compute folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    folders.forEach(f => {
      counts[f.name] = assets.filter(a => a.folder === f.name || a.folder === f.id).length;
    });
    counts['Unorganized'] = assets.filter(a => !a.folder || a.folder === 'Unorganized').length;
    return counts;
  }, [assets, folders]);

  // Filter and Sort Pipeline
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // 1. Search by file name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => a.fileName.toLowerCase().includes(q));
    }

    // 2. Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }

    // 3. Filter by Folder
    if (selectedFolderId !== 'all') {
      if (selectedFolderId === 'unorganized') {
        result = result.filter(a => !a.folder || a.folder === 'Unorganized');
      } else {
        const targetFolder = folders.find(f => f.id === selectedFolderId);
        const folderName = targetFolder ? targetFolder.name : selectedFolderId;
        result = result.filter(a => a.folder === folderName || a.folder === selectedFolderId);
      }
    }

    // 4. Filter by Tag
    if (selectedTag) {
      result = result.filter(a => a.tags?.includes(selectedTag));
    }

    // 5. Sort by Date or Name or Size
    result.sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.uploadDate).getTime();
        const timeB = new Date(b.uploadDate).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortField === 'name') {
        const comp = a.fileName.localeCompare(b.fileName);
        return sortOrder === 'asc' ? comp : -comp;
      }
      if (sortField === 'size') {
        return sortOrder === 'desc' ? b.fileSize - a.fileSize : a.fileSize - b.fileSize;
      }
      return 0;
    });

    return result;
  }, [assets, searchQuery, selectedCategory, selectedFolderId, selectedTag, sortField, sortOrder, folders]);

  // Upload Processing
  const handleProcessUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const brandId = currentBrand?.id || 'brand-crinoid';
    const brandName = currentBrand?.name || 'Crinoid Social';
    const uploader = {
      id: currentUser?.id || 'usr-default',
      name: currentUser?.name || 'Muthukumar',
      role: currentUser?.role || 'Social Lead',
      avatar: currentUser?.avatar
    };

    let targetFolder = 'Unorganized';
    if (selectedFolderId !== 'all' && selectedFolderId !== 'unorganized') {
      const f = folders.find(f => f.id === selectedFolderId);
      if (f) targetFolder = f.name;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate supported media types
      const isSupported = 
        file.type.startsWith('image/') || 
        file.type.startsWith('video/') || 
        file.type.startsWith('audio/') || 
        file.type === 'application/pdf' ||
        file.name.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|mov|webm|pdf)$/i);

      if (!isSupported) {
        showToast('error', `Unsupported file type "${file.name}". Please upload images, videos, GIFs, or brand files.`);
        errorCount++;
        continue;
      }

      try {
        const newAsset = await contentLibraryDb.uploadFile(file, {
          brandId,
          brandName,
          folder: targetFolder,
          uploader
        });
        setAssets(prev => [newAsset, ...prev]);
        successCount++;
      } catch (err: any) {
        console.error('Upload failed for file', file.name, err);
        showToast('error', `Failed to upload "${file.name}": ${err.message || 'Storage error'}`);
        errorCount++;
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      showToast('success', `Successfully uploaded ${successCount} asset(s) to Content Library.`);
    }
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessUpload(e.dataTransfer.files);
    }
  };

  // Folder Creation Handler
  const handleCreateFolder = (name: string) => {
    try {
      const brandId = currentBrand?.id || 'brand-crinoid';
      const newFolder = contentLibraryDb.createFolder(brandId, name);
      setFolders(prev => [...prev, newFolder]);
      showToast('success', `Created folder "${newFolder.name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create folder');
    }
  };

  // Quick Download from Card
  const handleQuickDownload = async (e: React.MouseEvent, asset: LibraryAsset) => {
    e.stopPropagation();
    try {
      await objectStorage.downloadObject(asset.storageKey, asset.fileName, asset.previewUrl);
      showToast('success', `Downloaded "${asset.fileName}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Download failed');
    }
  };

  // Format Helper
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="cl-container"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden Native File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        multiple 
        accept="image/*,video/*,application/pdf"
        onChange={(e) => {
          if (e.target.files) {
            handleProcessUpload(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Top Header */}
      <div className="cl-header">
        <div>
          <h1 className="cl-header-title">Content Library</h1>
          <p className="cl-header-subtitle">
            Centralized media asset storage and usage management for {currentBrand?.name || 'Crinoid'}
          </p>
        </div>

        <div className="cl-header-actions">
          <button 
            className="cl-btn cl-btn-secondary"
            onClick={() => setIsFolderModalOpen(true)}
            title="Create a new folder to organize media assets"
          >
            <FolderPlus size={15} /> New Folder
          </button>
          <button 
            className="cl-btn cl-btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload media to Content Library"
          >
            <Upload size={15} /> {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="cl-body">
        {/* Left Sidebar: Folders & Tags */}
        <aside className="cl-sidebar">
          {/* Folders Section */}
          <div>
            <div className="cl-sidebar-section-title">
              <span>Folders</span>
              <button 
                onClick={() => setIsFolderModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  padding: '2px'
                }}
                title="Add Folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            <div className="cl-folder-list">
              {/* All Assets */}
              <div 
                className={`cl-folder-item ${selectedFolderId === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFolderId('all')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderIcon size={15} />
                  <span>All Media</span>
                </div>
                <span className="cl-folder-badge">{folderCounts.all || 0}</span>
              </div>

              {/* Dynamic Folders */}
              {folders.map(f => (
                <div 
                  key={f.id}
                  className={`cl-folder-item ${selectedFolderId === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFolderId(f.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderIcon size={15} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {f.name}
                    </span>
                  </div>
                  <span className="cl-folder-badge">{folderCounts[f.name] || 0}</span>
                </div>
              ))}

              {/* Unorganized */}
              <div 
                className={`cl-folder-item ${selectedFolderId === 'unorganized' ? 'active' : ''}`}
                onClick={() => setSelectedFolderId('unorganized')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderIcon size={15} />
                  <span>Unorganized</span>
                </div>
                <span className="cl-folder-badge">{folderCounts.Unorganized || 0}</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {availableTags.length > 0 && (
            <div>
              <div className="cl-sidebar-section-title">
                <span>Filter by Tags</span>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableTags.map(tag => (
                  <span 
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedTag === tag ? 'var(--color-primary)' : 'var(--border-subtle)',
                      backgroundColor: selectedTag === tag ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
                      color: selectedTag === tag ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: selectedTag === tag ? 600 : 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Storage Details Info Card */}
          <div style={{ 
            marginTop: 'auto', 
            padding: '12px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--bg-subtle)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <HardDrive size={14} color="var(--color-primary)" /> Object Storage Engine
            </div>
            <div>Binary files isolated in IndexedDB object store with persistent metadata linking.</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="cl-main">
          {/* Toolbar (Search, Filter by Type, Sorting) */}
          <div className="cl-toolbar">
            {/* Top Toolbar: Search + Sort + View */}
            <div className="cl-toolbar-top">
              {/* Search Bar */}
              <div className="cl-search-box">
                <Search size={16} color="var(--text-light)" />
                <input 
                  type="text"
                  placeholder="Search assets by file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cl-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort By Date / Name Controls */}
              <div className="cl-toolbar-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={14} color="var(--text-light)" />
                  <select 
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="cl-select"
                  >
                    <option value="date-desc">Date: Newest First</option>
                    <option value="date-asc">Date: Oldest First</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="size-desc">Size: Largest First</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div style={{ 
                  display: 'flex', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '6px 10px',
                      background: viewMode === 'grid' ? 'var(--color-primary-light)' : '#ffffff',
                      color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title="Grid View"
                  >
                    <Grid size={15} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '6px 10px',
                      background: viewMode === 'list' ? 'var(--color-primary-light)' : '#ffffff',
                      color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--text-muted)',
                      border: 'none',
                      borderLeft: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                    title="List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Supported Asset Types) */}
            <div className="cl-category-pills">
              {categoriesList.map(cat => (
                <button 
                  key={cat.key}
                  className={`cl-pill ${selectedCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Zone Banner */}
          <div 
            className={`cl-dropzone ${isDragOver ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="cl-dropzone-icon">
              <Upload size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Drag and drop media files here, or click to browse
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Supports Images, Videos, GIFs, Logos, Brand assets, and Campaign creatives
            </div>
          </div>

          {/* Assets Summary Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredAssets.length} of {assets.length} asset{assets.length === 1 ? '' : 's'}
              {selectedFolderId !== 'all' && (
                <span> in <strong>{folders.find(f => f.id === selectedFolderId)?.name || selectedFolderId}</strong></span>
              )}
            </span>

            {(searchQuery || selectedCategory !== 'all' || selectedTag) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Asset Presentation: Grid or List */}
          {filteredAssets.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="cl-grid">
                {filteredAssets.map(asset => {
                  const isVid = asset.category === 'video' || asset.fileType.startsWith('video/');
                  const usageCount = asset.usageReferences?.length || 0;

                  return (
                    <div 
                      key={asset.id} 
                      className="cl-asset-card"
                      onClick={() => setPreviewAsset(asset)}
                    >
                      {/* Thumbnail Container */}
                      <div className="cl-card-thumb-container">
                        {isVid ? (
                          asset.previewUrl ? (
                            <video 
                              src={asset.previewUrl} 
                              className="cl-card-thumb"
                              preload="metadata"
                            />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                              <Play size={32} />
                              <span style={{ fontSize: '11px', marginTop: '4px' }}>Video Asset</span>
                            </div>
                          )
                        ) : asset.previewUrl ? (
                          <img 
                            src={asset.previewUrl} 
                            alt={asset.fileName} 
                            className="cl-card-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <FileText size={32} />
                            <span style={{ fontSize: '11px', marginTop: '4px' }}>{asset.fileType}</span>
                          </div>
                        )}

                        {/* Top Category Badge */}
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {asset.category.replace('_', ' ')}
                        </span>

                        {/* Video Duration Badge */}
                        {asset.duration && (
                          <span style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Clock size={10} /> {asset.duration}
                          </span>
                        )}

                        {/* Hover Overlay with Quick Actions */}
                        <div className="cl-card-overlay">
                          <button 
                            className="cl-overlay-btn" 
                            title="Preview Asset"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAsset(asset);
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            className="cl-overlay-btn" 
                            title="Download Asset"
                            onClick={(e) => handleQuickDownload(e, asset)}
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="cl-card-body">
                        <div className="cl-card-filename" title={asset.fileName}>
                          {asset.fileName}
                        </div>

                        <div className="cl-card-meta">
                          <span>{formatBytes(asset.fileSize)}</span>
                          <span>{asset.dimensions || asset.folder}</span>
                        </div>

                        {/* Usage References Badge */}
                        <div style={{ marginTop: '2px' }}>
                          {usageCount > 0 ? (
                            <span className="cl-usage-badge cl-usage-active">
                              <Layers size={10} /> Used in {usageCount} post{usageCount === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="cl-usage-badge cl-usage-unused">
                              Unused
                            </span>
                          )}
                        </div>

                        {/* Tags Preview */}
                        {asset.tags && asset.tags.length > 0 && (
                          <div className="cl-card-tags">
                            {asset.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="cl-card-tag">{tag}</span>
                            ))}
                            {asset.tags.length > 2 && (
                              <span className="cl-card-tag">+{asset.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-light)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Asset</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Size</th>
                      <th style={{ padding: '12px 16px' }}>Folder</th>
                      <th style={{ padding: '12px 16px' }}>Usage</th>
                      <th style={{ padding: '12px 16px' }}>Upload Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(asset => {
                      const usageCount = asset.usageReferences?.length || 0;
                      return (
                        <tr 
                          key={asset.id} 
                          style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => setPreviewAsset(asset)}
                        >
                          <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {asset.previewUrl ? (
                                <img src={asset.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FileText size={18} color="var(--text-muted)" />
                              )}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.fileName}</span>
                          </td>
                          <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {asset.category.replace('_', ' ')}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                            {formatBytes(asset.fileSize)}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                            {asset.folder}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {usageCount > 0 ? (
                              <span className="cl-usage-badge cl-usage-active">
                                {usageCount} post{usageCount === 1 ? '' : 's'}
                              </span>
                            ) : (
                              <span className="cl-usage-badge cl-usage-unused">Unused</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                            {new Date(asset.uploadDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button 
                              className="cl-overlay-btn" 
                              style={{ display: 'inline-flex', marginRight: '6px' }}
                              onClick={(e) => handleQuickDownload(e, asset)}
                              title="Download"
                            >
                              <Download size={13} />
                            </button>
                            <button 
                              className="cl-overlay-btn" 
                              style={{ display: 'inline-flex' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewAsset(asset);
                              }}
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Empty State */
            <div className="cl-empty-state">
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)'
              }}>
                {searchQuery ? <Search size={26} /> : <AlertCircle size={26} />}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {searchQuery 
                  ? `No media assets matching "${searchQuery}"`
                  : selectedFolderId !== 'all'
                  ? 'This folder is currently empty'
                  : 'No assets found in this filter'
                }
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: 0 }}>
                {searchQuery 
                  ? 'Try checking for spelling errors or searching with a different term.'
                  : 'Upload images, videos, GIFs or brand creatives to build your content library.'
                }
              </p>
              {searchQuery ? (
                <button 
                  className="cl-btn cl-btn-secondary"
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: '8px' }}
                >
                  Clear Search
                </button>
              ) : (
                <button 
                  className="cl-btn cl-btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ marginTop: '8px' }}
                >
                  <Upload size={14} /> Upload Media
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <AssetPreviewModal 
          asset={previewAsset}
          folders={folders}
          onClose={() => setPreviewAsset(null)}
          onAssetUpdated={(updated) => {
            setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
            setPreviewAsset(updated);
          }}
          onAssetDeleted={(deletedId) => {
            setAssets(prev => prev.filter(a => a.id !== deletedId));
            setPreviewAsset(null);
          }}
          showToast={showToast}
        />
      )}

      {/* Create Folder Modal */}
      <FolderModal 
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

