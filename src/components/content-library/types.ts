export type AssetCategory = 
  | 'all'
  | 'image' 
  | 'video' 
  | 'gif' 
  | 'logo' 
  | 'brand_asset' 
  | 'campaign_creative' 
  | 'other';

export interface LibraryFolder {
  id: string;
  name: string;
  brandId: string;
  createdAt: string;
  assetCount?: number;
}

export interface AssetUploader {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

export interface LibraryAsset {
  id: string; // e.g. "AST-1001"
  fileName: string; // e.g. "spring_campaign_hero.png"
  fileType: string; // MIME type e.g. "image/png", "video/mp4", "image/gif", "image/svg+xml"
  category: AssetCategory; // 'image' | 'video' | 'gif' | 'logo' | 'brand_asset' | 'campaign_creative' | 'other'
  fileSize: number; // In bytes
  dimensions?: string; // e.g. "1920 x 1080 px" (for images/videos/gifs/logos)
  duration?: string; // e.g. "00:45" (for videos)
  uploadDate: string; // ISO 8601 string
  uploader: AssetUploader;
  workspace: string; // Brand/Workspace name or ID (e.g. "Crinoid", "brand-crinoid")
  folder: string; // Folder ID or name (e.g. "root", "Brand Assets", "Campaign Creatives")
  tags: string[]; // e.g. ["Campaign", "Hero", "Instagram", "Q4"]
  usageReferences: string[]; // Array of Post IDs using this asset (e.g. ["CRN-1001", "CRN-1003"])
  storageKey: string; // Reference key to object storage
  storageProvider: 'indexeddb-object-storage' | 'remote-url';
  previewUrl?: string; // Cache/seed preview URL
}

export type SortField = 'date' | 'name' | 'size';
export type SortOrder = 'asc' | 'desc';

export interface AssetFilterState {
  searchQuery: string;
  category: AssetCategory;
  folderId: string; // 'all' | 'root' | folderId
  selectedTag: string | null;
  sortField: SortField;
  sortOrder: SortOrder;
}

