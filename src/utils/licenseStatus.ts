import { type Company } from '../hooks/useCompanies';

/**
 * Converte o campo `expiresAt` em um Date nativo.
 * O valor pode chegar como Timestamp do Firestore, objeto { seconds },
 * Date ou string — por isso normalizamos tudo aqui num lugar só.
 * Retorna null quando não há data válida.
 */
function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();      // Firestore Timestamp
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Reduz uma data ao início do seu dia (00:00:00 local). */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Verdadeiro se a licença está vencida pela regra "vale até o fim do dia":
 * só é considerada vencida a partir do dia SEGUINTE ao `expiresAt`.
 * (Comparação na meia-noite, igual à regra já existente no updateBatch.)
 */
export function isLicenseExpired(expiresAt: any, now: Date = new Date()): boolean {
  const exp = toDate(expiresAt);
  if (!exp) return false; // sem data => não expira por tempo
  return startOfDay(exp) < startOfDay(now);
}

/**
 * Status EFETIVO de uma unidade: combina a intenção administrativa
 * (status gravado no banco) com a expiração por data.
 *
 * Regra central: a expiração só pode SUSPENDER, nunca REATIVAR.
 * - Suspenso manualmente (mesmo com data futura) => continua suspenso.
 * - Ativo com data vencida                       => vira suspenso.
 */
export function getEffectiveStatus(
  company: Pick<Company, 'status' | 'expiresAt'>,
  now: Date = new Date()
): 'active' | 'suspended' {
  if (company.status === 'suspended') return 'suspended';
  return isLicenseExpired(company.expiresAt, now) ? 'suspended' : 'active';
}