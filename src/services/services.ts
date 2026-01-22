import { CrudService } from "@/services/crudService";
import { FamilyProfile, Visit } from "@/types/api";

export const familyService = new CrudService<FamilyProfile>("/family-profiles");
export const visitService = new CrudService<Visit>("/visits");