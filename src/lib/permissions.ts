export const Permission = {
    applicantUpdate: "applicant.update",

    familyProfileViewAny: "family_profile.view_any",
    familyProfileView: "family_profile.view",
    familyProfileCreate: "family_profile.create",
    familyProfileUpdate: "family_profile.update",
    familyProfileDelete: "family_profile.delete",

    familyMemberViewAny: "family_member.view_any",
    familyMemberView: "family_member.view",
    familyMemberCreate: "family_member.create",
    familyMemberUpdate: "family_member.update",
    familyMemberDelete: "family_member.delete",

    groupViewAny: "group.view_any",
    groupView: "group.view",
    groupUpdate: "group.update",

    visitViewAny: "visit.view_any",
    visitView: "visit.view",
    visitCreate: "visit.create",
    visitUpdate: "visit.update",
    visitDelete: "visit.delete",

    userViewAny: "user.view_any",
    userView: "user.view",
    userCreate: "user.create",
    userUpdate: "user.update",
    userDelete: "user.delete",

    roleViewAny: "role.view_any",
} as const;

export const hasPermission = (
    granted: readonly string[] | undefined | null,
    permission: string,
): boolean => Boolean(granted?.includes(permission));

export const hasEveryPermission = (
    granted: readonly string[] | undefined | null,
    permissions: readonly string[],
): boolean => permissions.every((permission) => hasPermission(granted, permission));

export const hasAnyPermission = (
    granted: readonly string[] | undefined | null,
    permissions: readonly string[],
): boolean => permissions.some((permission) => hasPermission(granted, permission));