import { NextResponse } from "next/server"
import admin from "firebase-admin"

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}

const adminAuth = admin.auth()

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    const user = await adminAuth.getUserByEmail(email)

    await adminAuth.updateUser(user.uid, {
      password: newPassword,
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    })
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to update password." },
      { status: 500 }
    )
  }
}