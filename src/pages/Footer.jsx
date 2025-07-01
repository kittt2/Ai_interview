import { Link } from "react-router-dom";
import { 
  Crown, 
  Mail, 
  Phone, 
  Github, 
  Twitter, 
  Linkedin, 
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 text-center">
          
          {/* Brand Section */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-violet-400" />
              <span className="text-2xl font-bold text-white">
                MyApp
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Empowering your journey with cutting-edge solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-3 mb-6">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-violet-400">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-violet-400">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-violet-400">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex justify-center space-x-6 text-sm">
              <a href="mailto:hello@myapp.com" className="flex items-center space-x-2 text-gray-400 hover:text-violet-400">
                <Mail className="h-4 w-4" />
                <span>hello@myapp.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center space-x-2 text-gray-400 hover:text-violet-400">
                <Phone className="h-4 w-4" />
                <span>+1 (234) 567-8900</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4 md:mb-0">
            <span>© {currentYear} MyApp. Made with</span>
            <Heart className="h-4 w-4 text-red-400 fill-current" />
            <span>by our team.</span>
          </div>
          
          <div className="flex space-x-4 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-violet-400">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-violet-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}