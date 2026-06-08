# CyberX Deepfake Video Detection and Analysis System

CyberX is an AI-powered deepfake video detection and analysis web application. It allows users to upload video files, run an analysis workflow, view detection results, manage analysis history, and generate PDF reports.

This project was developed as a cybersecurity and AI-based media analysis system focused on identifying potentially manipulated video content.

## Overview

CyberX provides a user-friendly dashboard for analysing videos and detecting possible deepfake indicators. The application includes authentication, video upload, analysis results, user history, admin views, and report generation.

The current web application includes a mock analysis API to demonstrate the complete deepfake detection workflow, dashboard experience, history tracking, and PDF report generation. The machine learning model integration can be extended in future versions.

## Features

- User authentication pages
- Login and signup flow
- User dashboard
- Admin dashboard
- Video upload interface
- Deepfake analysis workflow
- Analysis progress tracking
- Analysis result display
- Detection status such as clean or threat
- Confidence score and deepfake score
- Frame-level analysis display
- Detected artifact reporting
- Analysis history page
- Profile page
- PDF report generation
- Delete confirmation modal
- Responsive user interface
- Firebase configuration using environment variables
- Reusable UI component system

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase
- PDF-lib
- UUID
- Node.js
- API routes
- Component-based UI architecture

## Project Structure

```text
app/
  admin/
  analytics/
  api/
    analyze/
    delete/
    generate-report/
    history/
    reset-password/
  dashboard/
  history/
  login/
  profile/
  signup/
  globals.css
  layout.tsx
  page.tsx

components/
  ui/
  analysis-progress.tsx
  analysis-results.tsx
  cyberx-logo.tsx
  dashboard-video-uploader.tsx
  delete-confirmation-dialog.tsx
  history-panel.tsx
  navigation-bar.tsx
  otp-verification-modal.tsx
  result-card.tsx
  theme-provider.tsx
  video-uploader.tsx

context/
  auth-context.tsx

hooks/
  use-mobile.ts
  use-toast.ts

lib/
  firebase.ts
  history.ts
  utils.ts

public/
  icons and placeholder assets

styles/
  globals.css

components.json
next.config.mjs
next-env.d.ts
package.json
package-lock.json
postcss.config.mjs
tsconfig.json
README.md
