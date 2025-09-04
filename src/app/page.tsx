import Link from 'next/link';
import { 
  Star, 
  Gift, 
  Package, 
  MessageCircle, 
  TrendingUp,
  Shield,
  Smartphone
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="relative z-10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Loyalty</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/loyalty" className="nav-link-inactive">
                  My Points
                </Link>
                <Link href="/orders" className="nav-link-inactive">
                  Orders
                </Link>
                <Link href="/rewards" className="nav-link-inactive">
                  Rewards
                </Link>
                <Link href="/support" className="nav-link-inactive">
                  Support
                </Link>
              </div>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-outline">
                Sign In
              </Link>
              <Link href="/enroll" className="btn-primary">
                Join Now
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Loyalty Program,{' '}
              <span className="text-gradient-primary block">Simplified</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Access your points, track orders, and unlock exclusive rewards all in one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/enroll" className="btn-primary btn-lg">
                Get Started
              </Link>
              <Link href="/loyalty" className="btn-outline btn-lg">
                View Points
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your loyalty
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Points Tracking */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Points Tracking</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Monitor your loyalty points in real-time with detailed transaction history and earning breakdowns.
                </p>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Order Tracking</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Track your current orders with real-time shipping updates and delivery notifications.
                </p>
              </div>
            </div>

            {/* Exclusive Rewards */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Exclusive Rewards</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Unlock exclusive rewards, discounts, and special offers tailored to your preferences.
                </p>
              </div>
            </div>

            {/* AI Support */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI Support</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Get instant help with our AI-powered customer service agent available 24/7.
                </p>
              </div>
            </div>

            {/* Secure & Private */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Secure & Private</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security and privacy controls.
                </p>
              </div>
            </div>

            {/* Mobile First */}
            <div className="card">
              <div className="card-header">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Mobile First</h3>
              </div>
              <div className="card-body">
                <p className="text-gray-600">
                  Optimized for mobile devices with a responsive design that works perfectly on any screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start earning rewards?
              </h2>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <Link 
                  href="/enroll" 
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Enroll Now
                </Link>
                <Link 
                  href="/loyalty" 
                  className="text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Loyalty</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your comprehensive loyalty program platform. Track points, manage rewards, and stay connected with your favorite brands.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/loyalty" className="text-gray-400 hover:text-white transition-colors">My Points</Link></li>
                <li><Link href="/orders" className="text-gray-400 hover:text-white transition-colors">Order History</Link></li>
                <li><Link href="/rewards" className="text-gray-400 hover:text-white transition-colors">Available Rewards</Link></li>
                <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">My Profile</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center">
              © 2024 Customer Loyalty App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
