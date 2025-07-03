import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export function TermsOfService() {
  const navigate = useNavigate()

  console.log('=== TERMS OF SERVICE COMPONENT RENDER ===')
  console.log('Terms of Service component is rendering')
  console.log('=== END TERMS OF SERVICE COMPONENT RENDER ===')

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using AutoHotkey Generator, you accept and agree to be bound by
                the terms and provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                AutoHotkey Generator is a web application that helps users create automation scripts
                by converting plain English descriptions into valid AutoHotkey (.ahk) scripts.
                The service uses artificial intelligence to generate these scripts based on user input.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of the service, you must register for an account.
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to use the service only for lawful purposes and in accordance with these
                terms. You may not use the service to generate scripts for malicious purposes,
                including but not limited to unauthorized access to computer systems, data theft,
                or any other illegal activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Subscription and Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                Certain features of the service require payment. By subscribing to a paid plan,
                you agree to pay all fees associated with your chosen plan. Subscription fees are
                billed in advance and are non-refundable except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The service and its original content, features, and functionality are owned by
                AutoHotkey Generator and are protected by international copyright, trademark,
                patent, trade secret, and other intellectual property laws. The scripts generated
                by the service belong to you, the user.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The service is provided "as is" without any representations or warranties, express
                or implied. We do not warrant that the generated scripts will be error-free or
                suitable for your specific purposes. You use the generated scripts at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall AutoHotkey Generator be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without limitation, loss of
                profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately,
                without prior notice or liability, under our sole discretion, for any reason
                whatsoever, including without limitation if you breach the terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these terms at any time. If a revision
                is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at
                legal@autohotkeyGenerator.com or through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}