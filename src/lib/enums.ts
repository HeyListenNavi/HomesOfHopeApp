import { AttendanceStatus } from "@/services/generated/apiTypes";
import {
    ApplicantStatus,
    Currency,
    DocumentType,
    EducationLevel,
    FamilyStatus,
    HousingStatus,
    IndigenousLanguage,
    LandService,
    LandSize,
    MaritalStatus,
    Occupation,
    Relationship,
    Religion,
    TaskStatus,
    VisitStatus,
} from "@/services/generated/apiTypes";
import type { BoxIconName } from "@/components/Boxicons";

interface EnumMeta {
    value: string;
    label: string;
    emoji?: string;
}

interface EnumOption {
    label: string;
    value: string;
    emoji?: string;
}

export const toOptions = <T extends Record<string, EnumMeta>>(config: T): EnumOption[] =>
    Object.values(config).map(({ value, label, emoji }) => ({
        value,
        label,
        emoji,
    }));

export const RELATIONSHIP: Record<Relationship, EnumMeta> = {
    padre: { value: Relationship.padre, label: "Padre", emoji: "👨" },
    madre: { value: Relationship.madre, label: "Madre", emoji: "👩" },
    hijo: { value: Relationship.hijo, label: "Hijo(a)", emoji: "👶" },
    abuelo: { value: Relationship.abuelo, label: "Abuelo(a)", emoji: "👴" },
    nieto: { value: Relationship.nieto, label: "Nieto(a)", emoji: "🧸" },
    tutor: { value: Relationship.tutor, label: "Tutor(a)", emoji: "🧑‍🏫" },
    otro: { value: Relationship.otro, label: "Otro", emoji: "👤" },
};

export const MARITAL_STATUS: Record<MaritalStatus, EnumMeta> = {
    single: { value: MaritalStatus.single, label: "Soltero(a)" },
    married: { value: MaritalStatus.married, label: "Casado(a)" },
    divorced: { value: MaritalStatus.divorced, label: "Divorciado(a) / Separado(a)" },
    widowed: { value: MaritalStatus.widowed, label: "Viudo(a)" },
    cohabiting: { value: MaritalStatus.cohabiting, label: "Unión Libre" },
};

export const OCCUPATION: Record<Occupation, EnumMeta> = {
    construction_worker: { value: Occupation.construction_worker, label: "Albañilería" },
    factory_worker: { value: Occupation.factory_worker, label: "Fábrica" },
    house_cleaner: { value: Occupation.house_cleaner, label: "Limpieza de casas" },
    unemployed: { value: Occupation.unemployed, label: "No trabaja" },
    self_employed: { value: Occupation.self_employed, label: "Autoempleado(a)" },
    salesperson: { value: Occupation.salesperson, label: "Vendedor(a)" },
    call_center_agent: { value: Occupation.call_center_agent, label: "Call Center" },
    taxi_driver: { value: Occupation.taxi_driver, label: "Taxista" },
    security_guard: { value: Occupation.security_guard, label: "Guardia de seguridad" },
    delivery_driver: { value: Occupation.delivery_driver, label: "Repartidor" },
    rideshare_driver: { value: Occupation.rideshare_driver, label: "Uber / Didi" },
    waiter: { value: Occupation.waiter, label: "Mesero(a)" },
    cook: { value: Occupation.cook, label: "Cocinero(a)" },
    retired: { value: Occupation.retired, label: "Retirado(a)" },
    housewife: { value: Occupation.housewife, label: "Ama de casa" },
    student: { value: Occupation.student, label: "Estudiante" },
    nurse: { value: Occupation.nurse, label: "Enfermería" },
    carpenter: { value: Occupation.carpenter, label: "Carpintero(a)" },
    blacksmith: { value: Occupation.blacksmith, label: "Herrero(a)" },
    supermarket_worker: { value: Occupation.supermarket_worker, label: "Supermercado" },
    mechanic: { value: Occupation.mechanic, label: "Mecánico(a)" },
    stylist: { value: Occupation.stylist, label: "Estilista" },
    manicurist: { value: Occupation.manicurist, label: "Manicurista" },
    nanny: { value: Occupation.nanny, label: "Niñera" },
    janitor: { value: Occupation.janitor, label: "Intendencia" },
    cashier: { value: Occupation.cashier, label: "Cajero(a)" },
    veterinarian: { value: Occupation.veterinarian, label: "Veterinario(a)" },
    government_worker: { value: Occupation.government_worker, label: "Empleado(a) de gobierno" },
    other: { value: Occupation.other, label: "Otro" },
};

export const EDUCATION_LEVEL: Record<EducationLevel, EnumMeta> = {
    preschool: { value: EducationLevel.preschool, label: "Preescolar" },
    none: { value: EducationLevel.none, label: "Ninguno" },
    elementary: { value: EducationLevel.elementary, label: "Primaria" },
    middle_school: { value: EducationLevel.middle_school, label: "Secundaria" },
    high_school: { value: EducationLevel.high_school, label: "Preparatoria / Bachillerato" },
    university: { value: EducationLevel.university, label: "Universidad / Carrera Técnica" },
};

export const RELIGION: Record<Religion, EnumMeta> = {
    catholic: { value: Religion.catholic, label: "Católica" },
    christian: { value: Religion.christian, label: "Cristiana / Evangélica" },
    jehovahs_witness: { value: Religion.jehovahs_witness, label: "Testigo de Jehová" },
    mormon: { value: Religion.mormon, label: "Mormón" },
    none: { value: Religion.none, label: "Ninguna" },
    other: { value: Religion.other, label: "Otra" },
};

export const INDIGENOUS_LANGUAGE: Record<IndigenousLanguage, EnumMeta> = {
    nahuatl: { value: IndigenousLanguage.nahuatl, label: "Náhuatl" },
    maya: { value: IndigenousLanguage.maya, label: "Maya" },
    zapoteco: { value: IndigenousLanguage.zapoteco, label: "Zapoteco" },
    mixteco: { value: IndigenousLanguage.mixteco, label: "Mixteco" },
    tseltal: { value: IndigenousLanguage.tseltal, label: "Tseltal" },
    tsotsil: { value: IndigenousLanguage.tsotsil, label: "Tsotsil" },
    otomi: { value: IndigenousLanguage.otomi, label: "Otomí" },
    totonaco: { value: IndigenousLanguage.totonaco, label: "Totonaco" },
    mazateco: { value: IndigenousLanguage.mazateco, label: "Mazateco" },
    chol: { value: IndigenousLanguage.chol, label: "Chol" },
    other: { value: IndigenousLanguage.other, label: "Otro" },
};

export const LAND_SERVICES: Record<LandService, EnumMeta> = {
    electricity: { value: LandService.electricity, label: "Luz eléctrica", emoji: "⚡" },
    water: { value: LandService.water, label: "Agua potable", emoji: "💧" },
    septic_tank: { value: LandService.septic_tank, label: "Fosa séptica", emoji: "🚰" },
    sewage: { value: LandService.sewage, label: "Drenaje municipal", emoji: "🛣️" },
};

export const HOUSING_STATUS: Record<HousingStatus, EnumMeta> = {
    rented: { value: HousingStatus.rented, label: "Rentada", emoji: "🏠" },
    borrowed: { value: HousingStatus.borrowed, label: "Prestada", emoji: "🤝" },
    other: { value: HousingStatus.other, label: "Otro", emoji: "✨" },
};

export const CURRENCY: Record<Currency, EnumMeta> = {
    mxn: { value: Currency.mxn, label: "MXN ($ Mexicanos)" },
    usd: { value: Currency.usd, label: "USD ($ Dólares)" },
};

export const CITY: Record<string, EnumMeta> = {
    Tijuana: { value: "Tijuana", label: "Tijuana" },
    Rosarito: { value: "Rosarito", label: "Rosarito" },
};

export const FAMILY_STATUS: Record<
    FamilyStatus,
    EnumMeta & { bg: string; text: string }
> = {
    pre_profile: {
        value: FamilyStatus.pre_profile,
        label: "Pre-Perfil",
        bg: "bg-gray-100",
        text: "text-gray-700",
    },
    new: {
        value: FamilyStatus.new,
        label: "Nuevo",
        bg: "bg-gray-100",
        text: "text-gray-700",
    },
    potential: {
        value: FamilyStatus.potential,
        label: "Potencial",
        bg: "bg-blue-100",
        text: "text-blue-700",
    },
    in_process: {
        value: FamilyStatus.in_process,
        label: "En Proceso",
        bg: "bg-amber-100",
        text: "text-amber-700",
    },
    on_hold: {
        value: FamilyStatus.on_hold,
        label: "En Espera",
        bg: "bg-orange-100",
        text: "text-orange-700",
    },
    approved: {
        value: FamilyStatus.approved,
        label: "Aprobado",
        bg: "bg-green-100",
        text: "text-green-700",
    },
    programmed: {
        value: FamilyStatus.programmed,
        label: "Programado",
        bg: "bg-green-100",
        text: "text-green-700",
    },
    built: {
        value: FamilyStatus.built,
        label: "Construido",
        bg: "bg-emerald-100",
        text: "text-emerald-700",
    },
    not_eligible: {
        value: FamilyStatus.not_eligible,
        label: "No Califica",
        bg: "bg-red-100",
        text: "text-red-700",
    },
    dont_build: {
        value: FamilyStatus.dont_build,
        label: "No Elegible",
        bg: "bg-red-100",
        text: "text-red-700",
    },
};

export const LAND_SIZE: Record<LandSize, EnumMeta> = {
    "16x20": { value: LandSize["16x20"], label: "16x20" },
    "20x20": { value: LandSize["20x20"], label: "20x20" },
};

export const DOCUMENT: Record<DocumentType, EnumMeta> = {
    identification: { value: DocumentType.identification, label: "Identificación", emoji: "🆔" },
    birth_certificate: { value: DocumentType.birth_certificate, label: "Acta de Nacimiento", emoji: "📄" },
    income_proof: { value: DocumentType.income_proof, label: "Comprobante de Ingresos", emoji: "💰" },
    marriage_certificate: { value: DocumentType.marriage_certificate, label: "Acta de Matrimonio", emoji: "💍" },
    family_photo: { value: DocumentType.family_photo, label: "Foto Familiar", emoji: "📷" },
    land_ownership: { value: DocumentType.land_ownership, label: "Escritura de Terreno", emoji: "✍️" },
    land_receipt: { value: DocumentType.land_receipt, label: "Recibo de Terreno", emoji: "🧾" },
    ine: { value: DocumentType.ine, label: "INE", emoji: "🆔" },
    curp: { value: DocumentType.curp, label: "CURP", emoji: "📄" },
    proof_of_address: { value: DocumentType.proof_of_address, label: "Comprobante de Domicilio", emoji: "🏠" },
    contract: { value: DocumentType.contract, label: "Contrato", emoji: "📄" },
    report: { value: DocumentType.report, label: "Reporte", emoji: "📄" },
    photo: { value: DocumentType.photo, label: "Fotografía", emoji: "📷" },
    other: { value: DocumentType.other, label: "Otro", emoji: "📂" },
};

export const VISIT_STATUS: Record<VisitStatus, EnumMeta> = {
    scheduled: { value: VisitStatus.scheduled, label: "Programada" },
    completed: { value: VisitStatus.completed, label: "Completada" },
    cancelled: { value: VisitStatus.cancelled, label: "Cancelada" },
    no_show: { value: VisitStatus.no_show, label: "No Asistió" },
    rescheduled: { value: VisitStatus.rescheduled, label: "Reprogramada" },
    pending: { value: VisitStatus.pending, label: "Pendiente" },
};

export const TASK_STATUS: Record<
    TaskStatus,
    EnumMeta & { icon: BoxIconName; color: string }
> = {
    pending: {
        value: TaskStatus.pending,
        label: "Pendiente",
        icon: "bx-circle",
        color: "#9ca3af",
    },
    in_progress: {
        value: TaskStatus.in_progress,
        label: "En Progreso",
        icon: "bxs-hourglass",
        color: "#d97706",
    },
    completed: {
        value: TaskStatus.completed,
        label: "Completada",
        icon: "bxs-check-circle",
        color: "#16a34a",
    },
    cancelled: {
        value: TaskStatus.cancelled,
        label: "Cancelada",
        icon: "bx-circle",
        color: "#9ca3af",
    },
};

export const PROCESS_STATUS: Record<ApplicantStatus, EnumMeta> = {
    in_progress: { value: ApplicantStatus.in_progress, label: "En Proceso" },
    approved: { value: ApplicantStatus.approved, label: "Aprobado" },
    rejected: { value: ApplicantStatus.rejected, label: "Rechazado" },
    staff_approved: { value: ApplicantStatus.staff_approved, label: "Aprobado (Staff)" },
    staff_rejected: { value: ApplicantStatus.staff_rejected, label: "Rechazado (Staff)" },
    requires_revision: { value: ApplicantStatus.requires_revision, label: "Requiere Revisión" },
    canceled: { value: ApplicantStatus.canceled, label: "Cancelado" },
};

export const ATTENDANCE: Record<
    AttendanceStatus,
    EnumMeta & { bg: string; text: string; icon: BoxIconName; iconColor: string; iconBg: string }
> = {
    present: {
        value: AttendanceStatus.present,
        label: "Presente",
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "bxs-check-circle",
        iconColor: "#16a34a",
        iconBg: "bg-green-100",
    },
    attended: {
        value: AttendanceStatus.attended,
        label: "Asistió",
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "bxs-check-circle",
        iconColor: "#16a34a",
        iconBg: "bg-green-100",
    },
    absent: {
        value: AttendanceStatus.absent,
        label: "Ausente",
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "bxs-x-circle",
        iconColor: "#dc2626",
        iconBg: "bg-red-100",
    },
    pending: {
        value: AttendanceStatus.pending,
        label: "Pendiente",
        bg: "bg-amber-100",
        text: "text-amber-600",
        icon: "bxs-user",
        iconColor: "#d97706",
        iconBg: "bg-amber-100",
    },
};