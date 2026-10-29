import React, { useState, useEffect, useMemo } from 'react';
import { LibraryAsset, LibraryFolder, AssetCategory } from '../content-library/types';
import { contentLibraryDb } from '../../services/contentLibraryDatabase';
import { objectStorage } from '../../services/objectStorage';
import { SocialPlatform } from '../../types';
import { 
  X, 
  Search, 
  Folder as FolderIcon, 
  Check, 
  Play, 
  FileText, 
  Upload, 
  FolderKanban, 
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ContentLibraryMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachMedia: (selectedUrls: string[], detectedType: 'image' | 'video' | 'carousel') => void;
  onUploadFromDevice: () => void;
  selectedPlatforms: SocialPlatform[];
  currentAttachedUrls: string[];
  brandId: string;
  brandName: string;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const ContentLibraryMediaModal: React.FC<ContentLibraryMediaModalProps> = ({
  isOpen,
  onClose,
  onAttachMedia,
  onUploadFromDevice,
  selectedPlatforms,
  currentAttachedUrls,
  brandId,
  brandName,
  showToast
}) => {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isAttaching, setIsAttaching] = useState(false);

  // Platform constraints
  const isYouTubeOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube';
  const hasYouTube = selectedPlatforms.includes('youtube');

  // Load Content Library assets and folders on open
  useEffect(() => {
    if (isOpen) {
      try {
        const loadedFolders = contentLibraryDb.getFolders(brandId);
        const loadedAssets = contentLibraryDb.getAssets(brandId, brandName);
        setFolders(loadedFolders);
        setAssets(loadedAssets);
        setSelectedAssetIds(new Set());
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedFolder('all');
      } catch (err) {
        console.error('Failed to load Content Library for composer', err);
      }
    }
  }, [isOpen, brandId, brandName]);

  // Categories list
  const categoriesList: { key: AssetCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Videos' },
    { key: 'gif', label: 'GIFs' },
    { key: 'logo', label: 'Logos' },
    { key: 'brand_asset', label: 'Brand Assets' },
    { key: 'campaign_creative', label: 'Campaign Creatives' }
  ];

  // Filter pipeline
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Search by file name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => a.fileName.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }

    // Folder filter
    if (selectedFolder !== 'all') {
      result = result.filter(a => a.folder === selectedFolder || a.folder === `folder-${selectedFolder}`);
    }

    return result;
  }, [assets, searchQuery, selectedCategory, selectedFolder]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelect = (asset: LibraryAsset) => {
    // Platform validation: YouTube requires video only
    const isVid = asset.category === 'video' || asset.fileType.startsWith('video/');
    if (isYouTubeOnly && !isVid) {
      showToast('error', 'YouTube does not accept images. Please select a video asset.');
      return;
    }

    setSelectedAssetIds(prev => {
      const updated = new Set(prev);
      if (updated.has(asset.id)) {
        updated.delete(asset.id);
      } else {
        updated.add(asset.id);
      }
      return updated;
    });
  };

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Confirm Selection
  const handleConfirmAttach = async () => {
    if (selectedAssetIds.size === 0) return;
    setIsAttaching(true);

    try {
      const selectedAssets = assets.filter(a => selectedAssetIds.has(a.id));
      const resolvedUrls: string[] = [];
      let containsVideo = false;

      for (const asset of selectedAssets) {
        let finalUrl = asset.previewUrl;
        if (!finalUrl && asset.storageKey && asset.storageProvider === 'indexeddb-object-storage') {
          const storedUrl = await objectStorage.getObjectUrl(asset.storageKey);
          if (storedUrl) finalUrl = storedUrl;
        }

        if (finalUrl) {
          resolvedUrls.push(finalUrl);
        }

        if (asset.category === 'video' || asset.fileType.startsWith('video/')) {
          containsVideo = true;
        }
      }

      if (resolvedUrls.length === 0) {
        showToast('error', 'Could not resolve media storage URLs for selected assets.');
        setIsAttaching(false);
        return;
      }

      const totalMediaCount = currentAttachedUrls.length + resolvedUrls.length;
      const detectedType = containsVideo ? 'video' : totalMediaCount > 1 ? 'carousel' : 'image';

      onAttachMedia(resolvedUrls, detectedType);
      showToast('success', `Attached ${resolvedUrls.length} asset(s) from Content Library.`);
      onClose();
    } catch (err: any) {
      console.error('Error attaching Content Library media', err);
      showToast('error', err.message || 'Failed to attach selected media');
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-container"
        style={{
          maxWidth: '880px',
          width: '95vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light, #eef2ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #4f46e5)'
            }}>
              <FolderKanban size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Select from Content Library
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Choose existing media assets for your post or upload new files
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Upload from Device button right inside modal */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onUploadFromDevice();
              }}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '6px 12px'
              }}
              title="Upload new file from your device"
            >
              <Upload size={13} />
              <span>Upload New File</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                display: 'flex',
                borderRadius: '6px'
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Category Pills, Folder Select */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: '1 1 240px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 12px'
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search assets by file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  color: '#0f172a'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Folder Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FolderIcon size={14} color="#64748b" />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Folders ({assets.length})</option>
                {folders.map(f => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categoriesList.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: selectedCategory === cat.key ? 600 : 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.key ? 'var(--color-primary, #4f46e5)' : '#e2e8f0',
                  backgroundColor: selectedCategory === cat.key ? 'var(--color-primary, #4f46e5)' : '#ffffff',
                  color: selectedCategory === cat.key ? '#ffffff' : '#64748b',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          minHeight: '260px',
          maxHeight: '52vh'
        }}>
          {filteredAssets.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '14px'
            }}>
              {filteredAssets.map(asset => {
                const isSelected = selectedAssetIds.has(asset.id);
                const isVid = asset.category === 'video' || asset.fileType.startsWith('video/');
                const isAlreadyAttached = currentAttachedUrls.some(u => 
                  (asset.previewUrl && u === asset.previewUrl) || 
                  (asset.storageKey && u.includes(asset.storageKey))
                );
                const isIncompatibleYouTube = isYouTubeOnly && !isVid;

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (!isIncompatibleYouTube) {
                        handleToggleSelect(asset);
                      }
                    }}
                    style={{
                      border: '1px solid',
                      borderColor: isSelected 
                        ? 'var(--color-primary, #4f46e5)' 
                        : '#e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      cursor: isIncompatibleYouTube ? 'not-allowed' : 'pointer',
                      opacity: isIncompatibleYouTube ? 0.45 : 1,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isSelected 
                        ? '0 0 0 2px rgba(79, 70, 229, 0.2), 0 2px 6px rgba(0,0,0,0.06)' 
                        : '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease'
                    }}
                    title={
                      isIncompatibleYouTube 
                        ? 'YouTube posts only accept video files'
                        : isAlreadyAttached 
                        ? 'Already attached to this post (click to select again)' 
                        : asset.fileName
                    }
                  >
                    {/* Media Thumbnail Container */}
                    <div style={{
                      height: '115px',
                      backgroundColor: '#0f172a',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isVid ? (
                        asset.previewUrl ? (
                          <video 
                            src={asset.previewUrl} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            preload="metadata"
                          />
                        ) : (
                          <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Play size={24} />
                            <span style={{ fontSize: '10px', marginTop: '2px' }}>Video</span>
                          </div>
                        )
                      ) : asset.previewUrl ? (
                        <img 
                          src={asset.previewUrl} 
                          alt={asset.fileName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <FileText size={24} />
                          <span style={{ fontSize: '10px', marginTop: '2px' }}>{asset.fileType}</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        textTransform: 'uppercase'
                      }}>
                        {asset.category.replace('_', ' ')}
                      </span>

                      {/* Duration for video */}
                      {asset.duration && (
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Clock size={9} /> {asset.duration}
                        </span>
                      )}

                      {/* Checkbox Overlay in Top-Right */}
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'rgba(255, 255, 255, 0.85)',
                        border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {asset.fileName}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                        <span>{formatBytes(asset.fileSize)}</span>
                        <span>{asset.folder}</span>
                      </div>

                      {/* Status label if already attached */}
                      {isAlreadyAttached && (
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#0284c7',
                          backgroundColor: '#f0f9ff',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          width: 'fit-content',
                          marginTop: '2px'
                        }}>
                          Currently Attached
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={32} color="#94a3b8" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                {searchQuery 
                  ? `No media assets match "${searchQuery}"`
                  : 'No assets found in Content Library'
                }
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '340px' }}>
                {searchQuery
                  ? 'Try searching with another file name or clear your filters.'
                  : 'Upload media files directly from your computer to use them in your posts.'
                }
              </div>
              {searchQuery ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedFolder('all');
                  }}
                  style={{ marginTop: '6px' }}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    onUploadFromDevice();
                  }}
                  style={{ marginTop: '6px' }}
                >
                  <Upload size={13} />
                  <span>Upload Media from Computer</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
            {selectedAssetIds.size > 0 ? (
              <span>
                <strong>{selectedAssetIds.size}</strong> asset{selectedAssetIds.size === 1 ? '' : 's'} selected
                <button
                  type="button"
                  onClick={() => setSelectedAssetIds(new Set())}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #4f46e5)',
                    fontSize: '12px',
                    marginLeft: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </span>
            ) : (
              <span>Click on any media asset to select it</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isAttaching}
              style={{ padding: '7px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmAttach}
              disabled={selectedAssetIds.size === 0 || isAttaching}
              style={{
                padding: '7px 18px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isAttaching ? (
                'Attaching...'
              ) : (
                <>
                  <span>
                    Attach to Post {selectedAssetIds.size > 0 ? `(${selectedAssetIds.size})` : ''}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

