import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Home } from "./pages/Home"
import { Dashboard } from "./pages/Dashboard"
import { History } from "./pages/History"
import { Instructions } from "./pages/Instructions"
import { Pricing } from "./pages/Pricing"
import { Admin } from "./pages/Admin"
import { AccountSettings } from "./pages/AccountSettings"
import { PrivacyPolicy } from "./pages/PrivacyPolicy"
import { TermsOfService } from "./pages/TermsOfService"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AdminRoute } from "./components/AdminRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"

function App() {
  console.log('=== APP COMPONENT RENDER ===')
  console.log('Routes being registered...')
  console.log('=== END APP COMPONENT RENDER ===')

  return (
    <AuthProvider>
      <>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy-policy" element={
              <div>
                {console.log('=== PRIVACY POLICY ROUTE MATCHED ===')}
                <PrivacyPolicy />
              </div>
            } />
            <Route path="/terms-of-service" element={
              <div>
                {console.log('=== TERMS OF SERVICE ROUTE MATCHED ===')}
                <TermsOfService />
              </div>
            } />
            <Route path="/dashboard" element={
              // <ProtectedRoute>
              <Layout><Dashboard /></Layout>
              // </ProtectedRoute>
            } />
            <Route path="/history" element={
              // <ProtectedRoute>
              <Layout><History /></Layout>
              // </ProtectedRoute>
            }
            />
            <Route path="/account-settings" element={
              // <ProtectedRoute>
              <Layout><AccountSettings /></Layout>
              // </ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </>
    </AuthProvider>
  )
}

export default App