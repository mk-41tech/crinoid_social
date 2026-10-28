import { LibraryAsset, LibraryFolder, AssetCategory } from '../components/content-library/types';
import { DEFAULT_LIBRARY_FOLDERS, getInitialMockAssets } from '../components/content-library/mockLibraryData';
import { objectStorage } from './objectStorage';
import { PostRecord } from '../components/posts/types';

const STORAGE_KEY_ASSETS = 'crinoid_content_library_assets_v1';
const STORAGE_KEY_FOLDERS = 'crinoid_content_library_folders_v1';
const STORAGE_KEY_POSTS = 'crinoid_posts_database_v1';

export class ContentLibraryDatabaseService {
  /**
   * Get all folders for a brand
   */
  getFolders(brandId: string): LibraryFolder[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (stored) {
        const folders: LibraryFolder[] = JSON.parse(stored);
        const filtered = folders.filter(f => !f.brandId || f.brandId === brandId);
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.error('Failed to load library folders', e);
    }

    // Default folders initialized
    const defaultFolders = DEFAULT_LIBRARY_FOLDERS.map(f => ({ ...f, brandId }));
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(defaultFolders));
    } catch {}
    return defaultFolders;
  }

  /**
   * Create a new folder
   */
  createFolder(brandId: string, folderName: string): LibraryFolder {
    const trimmed = folderName.trim();
    if (!trimmed) throw new Error('Folder name cannot be empty');

    const folders = this.getFolders(brandId);
    if (folders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`A folder named "${trimmed}" already exists.`);
    }

    const newFolder: LibraryFolder = {
      id: 'folder-' + Date.now(),
      name: trimmed,
      brandId,
      createdAt: new Date().toISOString()
    };

    const updated = [...folders, newFolder];
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(updated));
    return newFolder;
  }

  /**
   * Delete a folder and move its assets to Unorganized
   */
  deleteFolder(brandId: string, folderId: string): void {
    const folders = this.getFolders(brandId);
    const targetFolder = folders.find(f => f.id === folderId);
    if (!targetFolder) return;

    const remainingFolders = folders.filter(f => f.id !== folderId);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(remainingFolders));

    // Update assets in this folder to 'Unorganized'
    const assets = this.getAssets(brandId, '');
    const updatedAssets = assets.map(asset => {
      if (asset.folder === targetFolder.name || asset.folder === targetFolder.id) {
        return { ...asset, folder: 'Unorganized' };
      }
      return asset;
    });
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(updatedAssets));
  }

  /**
   * Get all assets for a brand
   */
  getAssets(brandId: string, brandName: string): LibraryAsset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (stored) {
        const assets: LibraryAsset[] = JSON.parse(stored);
        if (Array.isArray(assets) && assets.length > 0) {
          // Sync usage references dynamically with posts database
          return this.syncAssetUsageReferences(assets, brandId);
        }
      }
    } catch (e) {
      console.error('Failed to load library assets', e);
    }

    // Seed defaults
    const defaults = getInitialMockAssets(brandId, brandName);
    try {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(defaults));
    } catch {}
    return this.syncAssetUsageReferences(defaults, brandId);
  }

  /**
   * Sync asset usage references with existing posts in crinoid_posts_database_v1
   */
  private syncAssetUsageReferences(assets: LibraryAsset[], brandId: string): LibraryAsset[] {
    try {
      const storedPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      if (!storedPosts) return assets;

      const posts: PostRecord[] = JSON.parse(storedPosts);
      const brandPosts = posts.filter(p => !p.brandId || p.brandId === brandId);

      return assets.map(asset => {
        const matchingPostIds = new Set<string>(asset.usageReferences || []);

        brandPosts.forEach(post => {
          if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
            const hasMedia = post.mediaUrls.some(url => 
              (asset.previewUrl && url.includes(asset.previewUrl)) ||
              (asset.storageKey && url.includes(asset.storageKey)) ||
              (asset.fileName && url.includes(asset.fileName))
            );
            if (hasMedia) {
              matchingPostIds.add(post.id);
            }
          }
        });

        return {
          ...asset,
          usageReferences: Array.from(matchingPostIds)
        };
      });
    } catch {
      return assets;
    }
  }

  /**
   * Upload a new media file into Object Storage and save metadata to Database
   */
  async uploadFile(
    file: File, 
    params: {
      brandId: string;
      brandName: string;
      folder?: string;
      category?: AssetCategory;
      tags?: string[];
      uploader: { id: string; name: string; role?: string; avatar?: string };
    }
  ): Promise<LibraryAsset> {
    const assetId = 'AST-' + Math.floor(1000 + Math.random() * 9000);
    const storageKey = `obj-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Store the binary file in IndexedDB Object Storage
    await objectStorage.saveObject(storageKey, file, file.name);

    // 2. Generate local object URL for preview
    const previewUrl = await objectStorage.getObjectUrl(storageKey) || '';

    // 3. Detect dimensions and duration where applicable
    let dimensions: string | undefined = undefined;
    let duration: string | undefined = undefined;

    const mime = file.type.toLowerCase();
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');

    if (isImage) {
      try {
        const dim = await this.extractImageDimensions(file);
        dimensions = `${dim.width} x ${dim.height} px`;
      } catch {}
    } else if (isVideo) {
      try {
        const meta = await this.extractVideoMeta(file);
        dimensions = `${meta.width} x ${meta.height} px`;
        duration = meta.duration;
      } catch {}
    }

    // 4. Determine category
    let category: AssetCategory = params.category || 'other';
    if (!params.category || params.category === 'all') {
      if (mime === 'image/gif') category = 'gif';
      else if (mime === 'image/svg+xml') category = 'logo';
      else if (isImage) category = 'image';
      else if (isVideo) category = 'video';
      else category = 'other';
    }

    const newAsset: LibraryAsset = {
      id: assetId,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      category,
      fileSize: file.size,
      dimensions,
      duration,
      uploadDate: new Date().toISOString(),
      uploader: params.uploader,
      workspace: params.brandName || 'Crinoid Social',
      folder: params.folder || 'Unorganized',
      tags: params.tags && params.tags.length > 0 ? params.tags : [category.toUpperCase()],
      usageReferences: [],
      storageKey,
      storageProvider: 'indexeddb-object-storage',
      previewUrl
    };

    // 5. Persist metadata to database
    const currentAssets = this.getAssets(params.brandId, params.brandName);
    const updatedAssets = [newAsset, ...currentAssets];
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(updatedAssets));

    return newAsset;
  }

  /**
   * Rename an asset (updates fileName without modifying object store binary)
   */
  renameAsset(assetId: string, newFileName: string, brandId: string): LibraryAsset {
    const trimmed = newFileName.trim();
    if (!trimmed) throw new Error('File name cannot be empty');

    const assets = this.getAssets(brandId, '');
    const assetIndex = assets.findIndex(a => a.id === assetId);
    if (assetIndex === -1) throw new Error(`Asset ${assetId} not found`);

    // Ensure extension is retained if omitted
    let finalName = trimmed;
    const currentExt = assets[assetIndex].fileName.split('.').pop();
    if (currentExt && !finalName.includes('.')) {
      finalName = `${finalName}.${currentExt}`;
    }

    const updatedAsset: LibraryAsset = {
      ...assets[assetIndex],
      fileName: finalName
    };

    assets[assetIndex] = updatedAsset;
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    return updatedAsset;
  }

  /**
   * Delete an asset from Database and Object Storage
   */
  async deleteAsset(assetId: string, brandId: string): Promise<boolean> {
    const assets = this.getAssets(brandId, '');
    const target = assets.find(a => a.id === assetId);
    if (!target) return false;

    // Delete binary from object store if stored locally
    if (target.storageKey && target.storageProvider === 'indexeddb-object-storage') {
      try {
        await objectStorage.deleteObject(target.storageKey);
      } catch (err) {
        console.warn('Failed to delete object from IndexedDB store', err);
      }
    }

    const filtered = assets.filter(a => a.id !== assetId);
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(filtered));
    return true;
  }

  /**
   * Update tags for an asset
   */
  updateAssetTags(assetId: string, newTags: string[], brandId: string): LibraryAsset {
    const assets = this.getAssets(brandId, '');
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) throw new Error(`Asset ${assetId} not found`);

    const updated = {
      ...assets[index],
      tags: newTags
    };

    assets[index] = updated;
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    return updated;
  }

  /**
   * Move asset to folder
   */
  moveAssetFolder(assetId: string, folderName: string, brandId: string): LibraryAsset {
    const assets = this.getAssets(brandId, '');
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) throw new Error(`Asset ${assetId} not found`);

    const updated = {
      ...assets[index],
      folder: folderName
    };

    assets[index] = updated;
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    return updated;
  }

  /**
   * Helper: extract image dimensions
   */
  private extractImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read image dimensions'));
      };
      img.src = url;
    });
  }

  /**
   * Helper: extract video dimensions and duration
   */
  private extractVideoMeta(file: File): Promise<{ width: number; height: number; duration: string }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const totalSecs = Math.round(video.duration || 0);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        resolve({
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
          duration: formatted
        });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read video metadata'));
      };
      video.src = url;
    });
  }
}

export const contentLibraryDb = new ContentLibraryDatabaseService();

