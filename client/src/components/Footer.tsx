import { Link } from "react-router-dom"

export function Footer() {
  const handleLinkClick = (linkName: string, href: string) => {
    console.log(`=== FOOTER LINK CLICK ===`)
    console.log(`Link clicked: ${linkName}`)
    console.log(`Target href: ${href}`)
    console.log(`Current location: ${window.location.pathname}`)
    console.log(`=== END FOOTER LINK CLICK ===`)
  }

  return (
    <footer className="fixed bottom-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-10">
      <div className="container flex h-14 items-center justify-between">
        <p className="mx-6 text-sm text-muted-foreground">
          Built by <a href="https://pythagora.ai" target="_blank" rel="noopener noreferrer">Pythagora</a>
        </p>
        <div className="flex items-center space-x-4 mx-6">
          <span className="text-sm text-muted-foreground">Legal:</span>
          <Link 
            to="/privacy-policy" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleLinkClick('Privacy Policy', '/privacy-policy')}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms-of-service" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleLinkClick('Terms of Service', '/terms-of-service')}
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}