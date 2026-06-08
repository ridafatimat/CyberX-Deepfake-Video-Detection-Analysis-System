import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import type { AnalysisResult } from "@/components/analysis-results"

function sanitizeForFirebase(result: AnalysisResult) {
  return {
    id:          result.id,
    fileName:    result.fileName,
    fileSize:    result.fileSize,
    analyzedAt:  result.analyzedAt,
    status:      result.status,
    threatLevel: result.threatLevel,
    findings: {
      deepfake: {
        detected:   result.findings.deepfake.detected,
        confidence: result.findings.deepfake.confidence ?? 0,
      },
      malware: {
        detected: result.findings.malware.detected,
        type:     result.findings.malware.type ?? null,
      },
      metadata: {
        suspicious: result.findings.metadata.suspicious,
        details:    result.findings.metadata.details ?? null,
      },
    },
  }
}

export async function saveResultToFirebase(uid: string, result: AnalysisResult) {
  try {
    const historyRef = collection(db, "users", uid, "history")
    await addDoc(historyRef, {
      ...sanitizeForFirebase(result),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error saving to Firebase:", error)
  }
}

export async function getHistoryFromFirebase(uid: string): Promise<AnalysisResult[]> {
  try {
    const historyRef = collection(db, "users", uid, "history")
    const q          = query(historyRef, orderBy("createdAt", "desc"))
    const snapshot   = await getDocs(q)
    return snapshot.docs.map((d) => ({
      ...(d.data() as AnalysisResult),
      id: d.id,
    }))
  } catch (error) {
    console.error("Error fetching history:", error)
    return []
  }
}

export async function deleteResultFromFirebase(uid: string, resultId: string) {
  try {
    await deleteDoc(doc(db, "users", uid, "history", resultId))
  } catch (error) {
    console.error("Error deleting from Firebase:", error)
  }
}

export async function clearAllHistoryFromFirebase(uid: string) {
  try {
    const historyRef = collection(db, "users", uid, "history")
    const snapshot   = await getDocs(historyRef)
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}