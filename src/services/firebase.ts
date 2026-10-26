import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CandidateUser, ExamAttempt } from '../types';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: getFirestore must pass the firestoreDatabaseId as required by the platform instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firebase Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test as instructed in the skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Conexão com Firestore confirmada com sucesso.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Cliente offline ou aguardando reconexão.');
    }
    return false;
  }
}

// Auto-authenticate anonymously or with session if not signed in, to allow rules to evaluate isSignedIn()
export async function ensureAuthenticated(): Promise<string> {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (err) {
    console.warn('[Firebase Auth] Erro ao autenticar anonimamente, usando fallback local:', err);
    return 'local-user';
  }
}

/**
 * Mapeia erros do Firebase Auth para mensagens amigáveis em Português
 */
export function mapFirebaseAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Palavra-passe ou e-mail incorrecto. Verifique os seus dados de acesso.';
    case 'auth/user-not-found':
      return 'Nenhum utilizador encontrado com este e-mail no Firebase. Crie uma nova conta ou verifique o endereço.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já se encontra registado. Introduza a palavra-passe para iniciar sessão.';
    case 'auth/weak-password':
      return 'A palavra-passe deve conter no mínimo 6 caracteres.';
    case 'auth/invalid-email':
      return 'O formato do e-mail introduzido é inválido.';
    case 'auth/too-many-requests':
      return 'Acesso temporariamente bloqueado por demasiadas tentativas. Aguarde alguns minutos.';
    case 'auth/network-request-failed':
      return 'Falha de comunicação com os servidores. Verifique a sua ligação de rede.';
    case 'auth/operation-not-allowed':
      return 'O fornecedor de E-mail/Senha não está ativado no Firebase Console.';
    default:
      return error?.message || 'Ocorreu um erro ao autenticar. Tente novamente.';
  }
}

/**
 * Inicia sessão no Firebase Auth com E-mail e Palavra-passe
 */
export async function loginWithFirebaseEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

/**
 * Cria uma nova conta no Firebase Auth com E-mail e Palavra-passe
 */
export async function registerWithFirebaseEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('[Firebase Auth] Aviso ao actualizar nome de exibição:', e);
    }
  }
  return cred.user;
}

/**
 * Envia um e-mail oficial para redefinição de palavra-passe
 */
export async function sendFirebasePasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Encerra a sessão ativa no Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Observa alterações no estado de autenticação do Firebase
 */
export function onFirebaseAuthStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Salva ou atualiza perfil do candidato no Firestore
 */
export async function syncCandidateToFirestore(candidate: CandidateUser): Promise<void> {
  const path = `candidates/${candidate.id}`;
  try {
    const docRef = doc(db, 'candidates', candidate.id);
    await setDoc(docRef, {
      ...candidate,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`[Firebase] Candidato ${candidate.name} sincronizado com sucesso.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Carrega a lista de todos os candidatos cadastrados no banco Firestore
 */
export async function loadCandidatesFromFirestore(): Promise<CandidateUser[]> {
  const path = 'candidates';
  try {
    const querySnapshot = await getDocs(collection(db, 'candidates'));
    const candidates: CandidateUser[] = [];
    querySnapshot.forEach((docSnap) => {
      candidates.push(docSnap.data() as CandidateUser);
    });
    return candidates;
  } catch (error) {
    console.warn('[Firebase Firestore] Leitura de candidatos em contingência local:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Salva uma tentativa de exame realizada pelo candidato
 */
export async function saveExamAttemptToFirestore(userId: string, candidateName: string, attempt: ExamAttempt): Promise<void> {
  const path = `exam_attempts/${attempt.id}`;
  try {
    const docRef = doc(db, 'exam_attempts', attempt.id);
    await setDoc(docRef, {
      id: attempt.id,
      userId,
      candidateName,
      date: attempt.date,
      score: (attempt.correctAnswers / Math.max(1, attempt.totalQuestions)) * 20, // 0 a 20 valores MININT
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctAnswers,
      durationMinutes: Math.round(attempt.durationSeconds / 60),
      passed: (attempt.correctAnswers / Math.max(1, attempt.totalQuestions)) >= 0.5,
      categoryScores: attempt.categoryScores,
    });
    console.log(`[Firebase] Exame ${attempt.id} guardado no Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Carrega histórico de exames de um candidato
 */
export async function loadCandidateExamsFromFirestore(userId: string): Promise<ExamAttempt[]> {
  const path = 'exam_attempts';
  try {
    const q = query(collection(db, 'exam_attempts'), where('userId', '==', userId), limit(30));
    const querySnapshot = await getDocs(q);
    const exams: ExamAttempt[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      exams.push({
        id: data.id,
        date: data.date,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctCount,
        scorePercentage: (data.score / 20) * 100,
        durationSeconds: (data.durationMinutes || 45) * 60,
        categoryScores: data.categoryScores || {},
      });
    });
    return exams;
  } catch (error) {
    console.warn('[Firebase Firestore] Leitura de exames em contingência local:', error instanceof Error ? error.message : error);
    return [];
  }
}

// Executa verificação inicial de conexão em background
testConnection();
