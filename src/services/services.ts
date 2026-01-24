import { CrudService } from "@/services/crudService";
import { FamilyProfile, Task, Visit } from "@/types/api";

export const familyService = new CrudService<FamilyProfile>("/family-profiles");
export const visitService = new CrudService<Visit>("/visits");
export const taskService = new CrudService<Task>("/tasks");