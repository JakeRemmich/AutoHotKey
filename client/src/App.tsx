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
import { AccountSettings } from "./pages/AccountSettings"
import { PrivacyPolicy } from "./pages/PrivacyPolicy"
import { TermsOfService } from "./pages/TermsOfService"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/common/Layout"
import { BlankPage } from "./pages/BlankPage"
import ScrollToTop from "./utils/ScrollToTop"
import { AdminRoute } from "./components/AdminRoute"
import { Admin } from "./pages/Admin"

function App() {


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

              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
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