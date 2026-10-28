import React, { useState, useEffect } from 'react';
import { LibraryAsset, LibraryFolder } from './types';
import { objectStorage } from '../../services/objectStorage';
import { contentLibraryDb } from '../../services/contentLibraryDatabase';
import { PostRecord } from '../posts/types';
import { 
  X, 
  Download, 
  Trash2, 
  Edit2, 
  Tag, 
  Folder as FolderIcon, 
  User, 
  Calendar, 
  HardDrive, 
  Maximize2, 
  Clock, 
  Check, 
  Share2, 
  Layers, 
  ExternalLink,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon, 
  XIcon 
} from '../common/SocialIcons';

interface AssetPreviewModalProps {
  asset: LibraryAsset | null;
  folders: LibraryFolder[];
  onClose: () => void;
  onAssetUpdated: (updated: LibraryAsset) => void;
  onAssetDeleted: (assetId: string) => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  asset,
  folders,
  onClose,
  onAssetUpdated,
  onAssetDeleted,
  showToast
}) => {
  if (!asset) return null;

  // Local state for editing metadata
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState(asset.fileName);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resolvedMediaUrl, setResolvedMediaUrl] = useState<string>(asset.previewUrl || '');

  // Posts that use this asset
  const [linkedPosts, setLinkedPosts] = useState<PostRecord[]>([]);

  // Resolve object storage binary URL if needed
  useEffect(() => {
    let active = true;
    const resolveUrl = async () => {
      if (asset.storageKey && asset.storageProvider === 'indexeddb-object-storage') {
        try {
          const url = await objectStorage.getObjectUrl(asset.storageKey);
          if (url && active) {
            setResolvedMediaUrl(url);
          }
        } catch (e) {
          console.error('Failed to resolve object storage URL', e);
        }
      } else if (asset.previewUrl) {
        setResolvedMediaUrl(asset.previewUrl);
      }
    };

    resolveUrl();
    return () => {
      active = false;
    };
  }, [asset]);

  // Load referenced posts from crinoid_posts_database_v1
  useEffect(() => {
    try {
      const stored = localStorage.getItem('crinoid_posts_database_v1');
      if (stored) {
        const posts: PostRecord[] = JSON.parse(stored);
        const matches = posts.filter(p => 
          (asset.usageReferences && asset.usageReferences.includes(p.id)) ||
          (p.mediaUrls && p.mediaUrls.some(u => 
            (asset.previewUrl && u.includes(asset.previewUrl)) ||
            (asset.storageKey && u.includes(asset.storageKey))
          ))
        );
        setLinkedPosts(matches);
      }
    } catch (e) {
      console.error('Failed to load linked posts', e);
    }
  }, [asset]);

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format upload date
  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Download Handler
  const handleDownload = async () => {
    try {
      await objectStorage.downloadObject(asset.storageKey, asset.fileName, asset.previewUrl);
      showToast('success', `Downloaded "${asset.fileName}" successfully.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to download asset');
    }
  };

  // Rename Handler
  const handleSaveRename = () => {
    try {
      const trimmed = newFileName.trim();
      if (!trimmed) {
        showToast('error', 'File name cannot be empty.');
        return;
      }
      const updated = contentLibraryDb.renameAsset(asset.id, trimmed, asset.workspace);
      onAssetUpdated(updated);
      setIsRenaming(false);
      showToast('success', `Renamed asset to "${updated.fileName}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to rename asset');
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await contentLibraryDb.deleteAsset(asset.id, asset.workspace);
      showToast('success', `Deleted "${asset.fileName}" from Content Library.`);
      onAssetDeleted(asset.id);
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete asset');
      setIsDeleting(false);
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (asset.tags.includes(trimmed)) {
      showToast('info', `Tag "${trimmed}" is already assigned.`);
      setTagInput('');
      setIsAddingTag(false);
      return;
    }
    const newTags = [...asset.tags, trimmed];
    const updated = contentLibraryDb.updateAssetTags(asset.id, newTags, asset.workspace);
    onAssetUpdated(updated);
    setTagInput('');
    setIsAddingTag(false);
    showToast('success', `Added tag "${trimmed}".`);
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = asset.tags.filter(t => t !== tagToRemove);
    const updated = contentLibraryDb.updateAssetTags(asset.id, newTags, asset.workspace);
    onAssetUpdated(updated);
    showToast('info', `Removed tag "${tagToRemove}".`);
  };

  // Folder Move
  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetFolder = e.target.value;
    const updated = contentLibraryDb.moveAssetFolder(asset.id, targetFolder, asset.workspace);
    onAssetUpdated(updated);
    showToast('success', `Moved to folder "${targetFolder}".`);
  };

  const isVideo = asset.category === 'video' || asset.fileType.startsWith('video/');
  const isImage = asset.category === 'image' || asset.category === 'logo' || asset.category === 'brand_asset' || asset.category === 'campaign_creative' || asset.category === 'gif' || asset.fileType.startsWith('image/');

  return (
    <div className="cl-modal-overlay" onClick={onClose}>
      <div 
        className="cl-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="cl-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '4px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              textTransform: 'uppercase'
            }}>
              {asset.category.replace('_', ' ')}
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {asset.fileName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="cl-btn cl-btn-secondary" 
              onClick={handleDownload}
              title="Download media asset"
            >
              <Download size={14} /> Download
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Media Preview + Metadata Pane */}
        <div className="cl-modal-body">
          {/* Media Preview Stage */}
          <div className="cl-modal-media-pane">
            {isVideo ? (
              <video 
                src={resolvedMediaUrl} 
                controls 
                autoPlay 
                playsInline
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              />
            ) : isImage ? (
              <img 
                src={resolvedMediaUrl} 
                alt={asset.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#ffffff' }}>
                <FileText size={64} style={{ opacity: 0.6, marginBottom: '12px' }} />
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{asset.fileName}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  {asset.fileType}
                </div>
              </div>
            )}
          </div>

          {/* Details & Metadata Sidebar */}
          <div className="cl-modal-details-pane">
            {/* Header: File Name & Quick Actions */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="cl-metadata-label">Asset Details</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    onClick={() => {
                      setIsRenaming(!isRenaming);
                      setNewFileName(asset.fileName);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={12} /> Rename
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      background: 'none',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#b91c1c',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>

              {/* Inline Rename Form */}
              {isRenaming ? (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input 
                    type="text" 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '13px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-primary)',
                      outline: 'none'
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setIsRenaming(false);
                    }}
                  />
                  <button 
                    className="cl-btn cl-btn-primary" 
                    onClick={handleSaveRename}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    Save
                  </button>
                  <button 
                    className="cl-btn cl-btn-secondary" 
                    onClick={() => setIsRenaming(false)}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {asset.fileName}
                </div>
              )}
            </div>

            {/* Delete Confirmation Box */}
            {showDeleteConfirm && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fca5a5', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '12px', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Confirm Deletion
                </div>
                <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                  Are you sure you want to permanently delete <strong>{asset.fileName}</strong>? Its media file will be removed from object storage.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    className="cl-btn cl-btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="cl-btn cl-btn-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Asset'}
                  </button>
                </div>
              </div>
            )}

            {/* 10 Required Metadata Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* 1. File Type */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">File Type</span>
                <span className="cl-metadata-value" style={{ textTransform: 'uppercase', fontSize: '12px' }}>
                  {asset.fileType}
                </span>
              </div>

              {/* 2. File Size */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">File Size</span>
                <span className="cl-metadata-value">
                  {formatBytes(asset.fileSize)}
                </span>
              </div>

              {/* 3. Dimensions */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Dimensions</span>
                <span className="cl-metadata-value">
                  {asset.dimensions || '—'}
                </span>
              </div>

              {/* 4. Duration */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Duration</span>
                <span className="cl-metadata-value">
                  {asset.duration || '—'}
                </span>
              </div>

              {/* 5. Upload Date */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Upload Date</span>
                <span className="cl-metadata-value" style={{ fontSize: '12px' }}>
                  {formatDate(asset.uploadDate)}
                </span>
              </div>

              {/* 6. Uploader */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Uploader</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {asset.uploader.avatar ? (
                    <img 
                      src={asset.uploader.avatar} 
                      alt="" 
                      style={{ width: '18px', height: '18px', borderRadius: '50%' }} 
                    />
                  ) : (
                    <User size={14} color="var(--text-muted)" />
                  )}
                  <span className="cl-metadata-value" style={{ fontSize: '12px' }}>
                    {asset.uploader.name}
                  </span>
                </div>
              </div>

              {/* 7. Workspace */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Workspace</span>
                <span className="cl-metadata-value" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {asset.workspace}
                </span>
              </div>

              {/* 8. Folder Organization */}
              <div className="cl-metadata-group">
                <span className="cl-metadata-label">Folder</span>
                <select 
                  value={asset.folder} 
                  onChange={handleFolderChange}
                  className="cl-select"
                  style={{ padding: '4px 8px', fontSize: '12px', marginTop: '2px' }}
                >
                  <option value="Unorganized">Unorganized</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 9. Tags Assignment & Display */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="cl-metadata-label">Tags</span>
                {!isAddingTag && (
                  <button 
                    onClick={() => setIsAddingTag(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    + Add Tag
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {asset.tags && asset.tags.length > 0 ? (
                  asset.tags.map(t => (
                    <span 
                      key={t}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={10} /> {t}
                      <span 
                        style={{ cursor: 'pointer', marginLeft: '2px', display: 'inline-flex' }} 
                        onClick={() => handleRemoveTag(t)}
                        title="Remove tag"
                      >
                        <X size={10} />
                      </span>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    No tags assigned.
                  </span>
                )}
              </div>

              {isAddingTag && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter tag name..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      outline: 'none'
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setIsAddingTag(false);
                    }}
                  />
                  <button 
                    className="cl-btn cl-btn-primary" 
                    onClick={handleAddTag}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Add
                  </button>
                  <button 
                    className="cl-btn cl-btn-secondary" 
                    onClick={() => setIsAddingTag(false)}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* 10. Usage References */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="cl-metadata-label">Usage References</span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: linkedPosts.length > 0 ? '#0284c7' : 'var(--text-light)'
                }}>
                  {linkedPosts.length} post{linkedPosts.length === 1 ? '' : 's'}
                </span>
              </div>

              {linkedPosts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedPosts.map(post => (
                    <div 
                      key={post.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--color-primary-light)'
                          }}>
                            {post.id}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            backgroundColor: post.status === 'published' ? '#dcfce7' : post.status === 'scheduled' ? '#dbeafe' : '#fef3c7',
                            color: post.status === 'published' ? '#15803d' : post.status === 'scheduled' ? '#1d4ed8' : '#b45309'
                          }}>
                            {post.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Social network badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {post.platforms?.map(plat => (
                            <span key={plat} style={{ display: 'flex', alignItems: 'center' }}>
                              {plat === 'instagram' && <InstagramIcon size={12} />}
                              {plat === 'facebook' && <FacebookIcon size={12} />}
                              {plat === 'linkedin' && <LinkedinIcon size={12} />}
                              {plat === 'youtube' && <YoutubeIcon size={12} />}
                              {plat === 'x' && <XIcon size={12} />}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {post.caption || 'No caption'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '6px', 
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px dashed var(--border-subtle)',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  Not currently used in any posts. Ready to use in new compositions.
                </div>
              )}
            </div>

            {/* Storage Provider & System Reference */}
            <div style={{ 
              marginTop: 'auto', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Storage: {asset.storageProvider}</span>
              <span>Ref: {asset.storageKey}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
