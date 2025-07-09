import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { BiUser } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";

const provider = new GoogleAuthProvider();

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);

      onClose();
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-sidebar border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BiUser className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Login</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background/50 rounded-md transition-colors"
          >
            <IoMdClose className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Google Login */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-md border border-gray-300 transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
