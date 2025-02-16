export interface GetMasterOptionsDto {
  name: string;
  slug: string;
  masterId?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  id?: number;
}

export interface GetMasterOptionAutoComplete {
  masterOption: GetMasterOptionsDto[];
  slug: string;
}
