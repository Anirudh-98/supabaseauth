import { Scale } from 'lucide-react';

const VerifyEmail = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <Scale className="h-16 w-16 mx-auto text-primary-600" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Verify Your Email
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We've sent you an email with a verification link. Please check your inbox and click the link to verify your email address.
        </p>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            After verifying your email, your account will be reviewed by an administrator. You'll receive another email once your account is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;