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
import { Layout } from "./components/common/Layout"
import { BlankPage } from "./pages/BlankPage"
import ScrollToTop from "./utils/ScrollToTop"

function App() {
  console.log('=== APP COMPONENT RENDER ===')
  console.log('Routes being registered...')
  console.log('=== END APP COMPONENT RENDER ===')

  return (
    <AuthProvider>
      <>

        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy-policy" element={
                <div>
                  <PrivacyPolicy />
                </div>
              } />
              <Route path="/terms-of-service" element={
                <div>
                  <TermsOfService />
                </div>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
              />
              <Route path="/account-settings" element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<BlankPage />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster />
      </>
    </AuthProvider>
  )
}

export default App