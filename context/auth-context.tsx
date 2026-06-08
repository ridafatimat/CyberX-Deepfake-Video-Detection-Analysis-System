"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  updateProfile as firebaseUpdateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface User {
  uid: string
  name: string
  email: string
  profilePicture?: string
  createdAt?: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userRef  = doc(db, "users", firebaseUser.uid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const data = userSnap.data()
            setUser({
              uid:            firebaseUser.uid,
              name:           data.name           || firebaseUser.email?.split("@")[0] || "User",
              email:          data.email          || firebaseUser.email || "",
              profilePicture: data.profilePicture || "",
              createdAt:      data.createdAt?.toDate?.()?.toISOString() || data.createdAt || "",
              isAdmin:        data.isAdmin        || false,
            })
          } else {
            setUser({
              uid:   firebaseUser.uid,
              name:  firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser({
            uid:   firebaseUser.uid,
            name:  firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // ── Login ──────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      let message = "Login failed. Please try again."
      if (error.code === "auth/invalid-credential") message = "Invalid email or password."
      else if (error.code === "auth/user-not-found") message = "No account found with this email."
      else if (error.code === "auth/wrong-password")  message = "Incorrect password."
      else if (error.code === "auth/invalid-email")   message = "Invalid email format."
      return { success: false, error: message }
    }
  }

  // ── Signup ─────────────────────────────────────────────────────
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser   = userCredential.user

      await firebaseUpdateProfile(firebaseUser, { displayName: name })

      // Check if admin email
      const isAdmin = email === "admin@cyberx.com"

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid:            firebaseUser.uid,
        name,
        email,
        profilePicture: "",
        isAdmin,
        createdAt:      serverTimestamp(),
      })

      return { success: true }
    } catch (error: any) {
      let message = "Signup failed. Please try again."
      if (error.code === "auth/email-already-in-use") message = "This email is already registered."
      else if (error.code === "auth/invalid-email")   message = "Invalid email format."
      else if (error.code === "auth/weak-password")   message = "Password should be at least 6 characters."
      return { success: false, error: message }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // ── Update Profile ─────────────────────────────────────────────
  const updateProfile = async (
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.uid) throw new Error("Not authenticated")

      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      })

      const currentUser = auth.currentUser
      if (currentUser && data.name) {
        await firebaseUpdateProfile(currentUser, { displayName: data.name })
      }

      setUser((prev) => prev ? { ...prev, ...data } : prev)
      return { success: true }
    } catch (error: any) {
      console.error("Update profile error:", error)
      return { success: false, error: error.message || "Failed to update profile" }
    }
  }

  // ── Update Password ────────────────────────────────────────────
  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser || !user?.email) throw new Error("Not authenticated")

      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await firebaseUpdatePassword(currentUser, newPassword)

      await updateDoc(doc(db, "users", user.uid), {
        passwordUpdatedAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error: any) {
      console.error("Update password error:", error)
      if (error.code === "auth/wrong-password")  return { success: false, error: "Current password is incorrect" }
      if (error.code === "auth/weak-password")   return { success: false, error: "New password is too weak" }
      return { success: false, error: error.message || "Failed to change password" }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-cyber flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748b]">Loading CyberX...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.isAdmin || false,
      login,
      signup,
      logout,
      updateProfile,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}