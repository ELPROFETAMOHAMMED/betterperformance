export interface ChocoPackage {
  id: string;
  version: string;
  title: string;
  description: string;
  publisher: string;
}

export interface NugetSearchResponse {
  data: Array<{
    id: string;
    version: string;
    title?: string;
    description?: string;
    authors?: string;
  }>;
}
