import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#10a37f] hover:bg-[#0d8a6b] text-sm normal-case',
              card: 'bg-[#2d2d2d] border border-[#404040]',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-300',
              socialButtonsBlockButton: 'bg-[#404040] hover:bg-[#505050] text-white border border-[#505050]',
              formFieldInput: 'bg-[#404040] border border-[#505050] text-white',
              formFieldLabel: 'text-gray-300',
              footerActionLink: 'text-[#10a37f] hover:text-[#0d8a6b]',
              identityPreviewText: 'text-gray-300',
              formResendCodeLink: 'text-[#10a37f] hover:text-[#0d8a6b]',
            }
          }}
        />
      </div>
    </div>
  );
}
