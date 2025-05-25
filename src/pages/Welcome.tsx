import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Scale, Gavel, BookOpen, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

const Welcome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Scale className="h-16 w-16 mx-auto text-primary-800" />
          <h1 className="mt-6 text-4xl md:text-5xl font-serif font-bold text-primary-800 leading-tight">
            Transform Legal Research with AI
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Advocate AI helps legal professionals research faster, find relevant cases, and draft documents with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Button onClick={() => navigate('/home')} size="lg">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/signup')} size="lg">
                  Get Started
                </Button>
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="outline" 
                  size="lg"
                >
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 rounded-lg my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-primary-800">
              Powerful Legal Research Tools
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI with legal expertise to deliver accurate, relevant results.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-card card-hover">
              <Gavel className="h-12 w-12 text-accent-500" />
              <h3 className="mt-4 text-xl font-serif font-bold text-primary-800">
                Case Law Analysis
              </h3>
              <p className="mt-2 text-gray-600">
                Find relevant precedents and analyze case law to strengthen your arguments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-card card-hover">
              <BookOpen className="h-12 w-12 text-accent-500" />
              <h3 className="mt-4 text-xl font-serif font-bold text-primary-800">
                Legal Research Assistant
              </h3>
              <p className="mt-2 text-gray-600">
                Ask questions in plain language and receive comprehensive legal answers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-card card-hover">
              <ShieldCheck className="h-12 w-12 text-accent-500" />
              <h3 className="mt-4 text-xl font-serif font-bold text-primary-800">
                Secure & Confidential
              </h3>
              <p className="mt-2 text-gray-600">
                Your legal research and client information is always kept private and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-primary-800">
            Ready to transform your legal research?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of legal professionals who trust Advocate AI for their research needs.
          </p>
          <div className="mt-8">
            {user ? (
              <Button onClick={() => navigate('/home')} size="lg">
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate('/signup')} size="lg">
                Start Free Trial
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;