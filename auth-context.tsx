"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface User {
  name: string
  email: string
  uid: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
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
              uid:   firebaseUser.uid,
              name:  data.name  || firebaseUser.email?.split("@")[0] || "User",
              email: data.email || firebaseUser.email || "",
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

      // Always mark loading done — whether logged in or not
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      let message = "Login failed. Please try again."
      if (error.code === "auth/invalid-credential") message = "Invalid email or password."
      else if (error.code === "auth/user-not-found")  message = "No account found with this email."
      else if (error.code === "auth/wrong-password")  message = "Incorrect password."
      else if (error.code === "auth/invalid-email")   message = "Invalid email format."
      return { success: false, error: message }
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser   = userCredential.user

      await setDoc(doc(db, "users", firebaseUser.uid), {
        uid:       firebaseUser.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error: any) {
      console.error("Signup error:", error)
      let message = "Signup failed. Please try again."
      if (error.code === "auth/email-already-in-use") message = "This email is already registered."
      else if (error.code === "auth/invalid-email")   message = "Invalid email format."
      else if (error.code === "auth/weak-password")   message = "Password should be at least 6 characters."
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Don't render anything until Firebase auth state is known
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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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