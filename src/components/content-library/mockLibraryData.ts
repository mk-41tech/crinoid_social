import { LibraryAsset, LibraryFolder } from './types';

export const DEFAULT_LIBRARY_FOLDERS: LibraryFolder[] = [
  {
    id: 'folder-brand',
    name: 'Brand Assets',
    brandId: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'folder-campaigns',
    name: 'Campaign Creatives',
    brandId: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'folder-logos',
    name: 'Logos',
    brandId: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'folder-social',
    name: 'Social Promos',
    brandId: '',
    createdAt: new Date().toISOString()
  }
];

export const getInitialMockAssets = (_brandId: string, _brandName: string): LibraryAsset[] => [];
