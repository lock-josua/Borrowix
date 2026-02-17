import { Button } from "@/components/ui/button";

export default function GoogleAuthButton() {
  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleLogin}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </Button>
  );
}
