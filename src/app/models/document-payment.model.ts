// ══════════════════════════════════════════════════════════════════════════════
//  Document–Payment Analysis – TypeScript interfaces
//  Mirrors DashboardCore/Dtos/DocumentPaymentAnalyseDto.cs
// ══════════════════════════════════════════════════════════════════════════════

export interface DocumentPaymentFilterDto {
  dateDebut?: string;
  dateFin?: string;
  classeurdocumentId?: number;
}

export interface DocumentPaymentSummaryDto {
  totalDocuments: number;
  totalOperations: number;
  totalMontant: number;
  documentsAvecOperations: number;
  documentsSansOperations: number;
  parClasseur: PaymentByClasseurDto[];
  parDevise: PaymentByDeviseDto[];
}

export interface PaymentByDeviseDto {
  devisedocument: string | null;
  nombreDocuments: number;
  nombreOperations: number;
  totalMontant: number;
}

export interface PaymentByDocumentTypeDto {
  typedocument: string | null;
  nombreDocuments: number;
  nombreOperations: number;
  totalMontant: number;
}

export interface PaymentByDocumentCategoryDto {
  categoriedocument: string | null;
  nombreDocuments: number;
  nombreOperations: number;
  totalMontant: number;
}

export interface PaymentByCodeOperationDto {
  code: string | null;
  intitule: string | null;
  categorie: string | null;
  nombreOperations: number;
  totalMontant: number;
}

export interface PaymentByClasseurDto {
  classeurdocumentId: number | null;
  nomClasseur: string | null;
  nombreDocuments: number;
  nombreOperations: number;
  parDevise: PaymentByDeviseDto[];
}

export interface PaymentByDocumentStateDto {
  etatdocument: string | null;
  nombreDocuments: number;
  nombreOperations: number;
  totalMontant: number;
}

export interface DocumentPaymentTrendDto {
  annee: number;
  mois: number;
  totalMontant: number;
  nombreOperations: number;
}

export interface DocumentOperationDetailDto {
  documentId: number;
  numerodocument: string | null;
  typedocument: string | null;
  categoriedocument: string | null;
  sensdocument: string | null;
  etatdocument: string | null;
  montantnetdocument: number | null;
  beneficiairedocument: string | null;
  exercicedocument: string | null;
  classeurdocumentId: number | null;
  nomClasseur: string | null;
  operationId: number;
  dateoperation: string;
  montantoperation: number;
  sensoperation: string | null;
  codeoperation: string | null;
  codeIntitule: string | null;
  codeCategorie: string | null;
  etatoperation: string | null;
  beneficiaireoperation: string | null;
}

export interface DocumentPaymentLookupsDto {
  classeurs: ClasseurLookupDto[];
}

export interface ClasseurLookupDto {
  id: number;
  nom: string;
}

export interface ExecutionByClasseurPeriodDto {
  classeurdocumentId: number | null;
  nomClasseur: string | null;
  annee: number;
  mois: number;
  nombreDocuments: number;
  nombreOperations: number;
  totalMontant: number;
}

export interface ExecutionByClasseurResultDto {
  totalMontant: number;
  totalDocumentsExecutes: number;
  totalOperations: number;
  details: ExecutionByClasseurPeriodDto[];
}
