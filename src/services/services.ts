import { CrudService } from "@/services/crudService";
import {
    FamilyProfile,
    FamilyMember,
    Visit,
    Task,
    Note,
    Document,
    Testimony,
    User,
} from "@/types/api";

export const familyService = new CrudService<FamilyProfile>("/family-profiles");
export const familyMemberService = new CrudService<FamilyMember>(
    "/family-members",
);
export const visitService = new CrudService<Visit>("/visits");
export const taskService = new CrudService<Task>("/tasks");
export const userService = new CrudService<User>("/users");

export const noteService = new CrudService<Note>("/notes");
export const documentService = new CrudService<Document>("/documents");
export const testimonyService = new CrudService<Testimony>("/testimonies");
