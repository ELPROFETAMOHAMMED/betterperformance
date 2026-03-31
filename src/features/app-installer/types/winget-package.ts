export interface WingetPackage {
  Id: string;
  IconUrl: string | null;
  Latest: {
    Name: string;
    Publisher: string;
    Description: string;
  };
}

export interface WingetSearchResponse {
  Packages: WingetPackage[];
  Total: number;
}
