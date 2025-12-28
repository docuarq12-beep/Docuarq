
export interface GalleryImage {
  src: string;
  description: string;
}

export interface Project {
  id: string;
  clientName: string;
  projectTitle: string;
  description: string;
  beforeImg: string;
  afterImg: string;
  galleryImages: GalleryImage[];
  videoUrl?: string;
  coverImage?: string;
  createdAt: any;
  updatedAt: any;
}

export enum ViewMode {
  DASHBOARD = 'dashboard',
  EDIT = 'edit',
  PRESENTATION = 'presentation'
}
