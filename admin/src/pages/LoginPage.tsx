import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Eye, EyeOff, Lock, Mail, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { AuthAPI, setToken } from '@/lib/api';
import { useRole } from '@/contexts/RoleContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [remember, setRemember] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { setCurrentRole, setPermissions } = useRole();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (forgotMode) {
        if (!email) {
          toast.error('Please enter your email');
          return;
        }
        if (!resetStep) {
          await AuthAPI.forgot({ email });
          setResetStep(true);
          toast.success('Reset code sent to your email');
          return;
        } else {
          if (!resetOtp || !newPassword) {
            toast.error('Enter the code and new password');
            return;
          }
          await AuthAPI.reset({ email, otp: resetOtp, password: newPassword });
          toast.success('Password reset. Please log in.');
          setForgotMode(false);
          setResetStep(false);
          setResetOtp('');
          setNewPassword('');
          return;
        }
      }
      if (!email || !password) {
        toast.error('Please enter email and password');
        return;
      }
      if (requiresOTP && !otp) {
        toast.error('Please enter the OTP sent to your email');
        return;
      }
      const data = await AuthAPI.login({ email, password, otp: requiresOTP ? otp : undefined });
      if (data.requiresOTP) {
        setRequiresOTP(true);
        toast.success(data.message || 'OTP sent to your email');
        return;
      }
      if (data.token && data.user) {
        setToken(data.token, remember);
        setCurrentRole(data.user.role);
        setPermissions((data.user.permissions || []) as any);
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('user-email', data.user.email);
        storage.setItem('user-name', data.user.name || data.user.email);
        storage.setItem('user-id', data.user.id);
        toast.success('Login successful');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setRequiresOTP(false);
    setOtp('');
    setForgotMode(false);
    setResetStep(false);
    setResetOtp('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <img src="/assets/img/logo/edunyte-light.png" width={100} height={100} alt="Logo" className="w-52 h-52 mx-auto" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {requiresOTP ? 'Enter Verification Code' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {requiresOTP
                ? 'We sent a verification code to your email'
                : 'Sign in to access admin/teacher dashboard'}
            </p>
          </div>

          <Card className="p-6 border-border bg-card/80 backdrop-blur-sm shadow-lg animate-slide-up">
            <form onSubmit={handleLogin} className="space-y-5">
              {!requiresOTP && !forgotMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-muted/50"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={(checked) => setRemember(Boolean(checked))}
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setResetStep(false);
                        setRequiresOTP(false);
                        setOtp('');
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              ) : forgotMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {resetStep && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="resetOtp">Reset Code</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="resetOtp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                            className="pl-10 bg-muted/50 text-center text-2xl tracking-widest"
                            maxLength={6}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-muted/50"
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="w-1/3"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {resetStep ? 'Resetting...' : 'Sending...'}
                        </div>
                      ) : resetStep ? (
                        'Reset Password'
                      ) : (
                        'Send Reset Code'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-10 bg-muted/50 text-center text-2xl tracking-widest"
                        maxLength={6}
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check your email for the verification code
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </>
              )}

              {!forgotMode && (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {requiresOTP ? 'Verifying...' : 'Signing in...'}
                    </div>
                  ) : (
                    requiresOTP ? 'Verify Code' : 'Sign In'
                  )}
                </Button>
              )}
            </form>

            {!requiresOTP && (
              <div className="mt-6">
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    Secure Access Only
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="text-muted-foreground">
                    Secure access only. Use your issued admin credentials to sign in.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {!requiresOTP && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button className="text-primary hover:underline">
                Contact Administrator
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
