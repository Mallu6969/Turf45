import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, Eye, EyeOff, ArrowLeft, Lock, KeyRound, User, Sparkles, Award } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

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
    <div className="public-page min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Hidden Camera Elements */}
      <video 
        ref={videoRef} 
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Premium Background with Subtle Sports Image */}
      <div className="absolute inset-0 z-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1920&q=80"
            alt="Sports Background"
            className="w-full h-full object-cover"
          />
          {/* Subtle Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-green-900/95"></div>
          {/* Additional Green Accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-900/30 via-transparent to-emerald-900/20"></div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Premium Back Button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute top-6 left-6 z-20 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Button>

      {/* Trust Badges */}
      <div className="absolute top-6 right-6 z-20 hidden lg:flex items-center gap-3">
        <Badge className="bg-green-500/20 backdrop-blur-md text-green-100 border-green-400/30 px-4 py-2">
          <Award className="h-4 w-4 mr-2" />
          Secure Login
        </Badge>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Premium Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-2xl animate-pulse"></div>
              {/* Logo Container */}
              <div className="relative">
                <img
                  src="/Turf45_transparent.png"
                  alt="Turf45 Logo"
                  className="h-20 w-auto object-contain"
                  style={{
                    filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.5))",
                  }}
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-green-200 text-sm uppercase tracking-wider font-medium flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Administrator Portal
          </p>
        </div>
        
        {/* Premium Login Card with Advanced Glassmorphism */}
        <Card className="backdrop-blur-2xl bg-white/10 border-2 border-white/20 shadow-2xl rounded-3xl overflow-hidden relative">
          {/* Card Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-green-500/5 pointer-events-none"></div>
          
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 opacity-50 blur-xl animate-pulse"></div>
          
          <CardHeader className="text-center relative z-10 pb-4 pt-8">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Facility Manager Login
            </CardTitle>
            <p className="text-green-100 text-sm">Enter your credentials to access the control panel</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 relative z-10 px-8 pb-8">
              {/* Login Type Tabs - Premium Style */}
              <div className="flex justify-center">
                <Tabs defaultValue="admin" value={loginType} onValueChange={setLoginType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 border border-white/10">
                    <TabsTrigger 
                      value="admin" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/50 rounded-xl transition-all duration-300 text-white/70"
                    >
                      <Shield size={16} />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger 
                      value="staff" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/50 rounded-xl transition-all duration-300 text-white/70"
                    >
                      <Users size={16} />
                      Staff
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Username Field - Premium Style */}
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-semibold text-green-100 flex items-center gap-2">
                  <User size={16} />
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="relative bg-white/10 backdrop-blur-sm border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 rounded-2xl h-14 text-white placeholder:text-white/50 transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Password Field - Premium Style */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-semibold text-green-100 flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative bg-white/10 backdrop-blur-sm border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 rounded-2xl h-14 text-white placeholder:text-white/50 pr-12 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-green-400 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-green-300 hover:text-green-200 p-0 h-auto text-sm font-medium"
                  onClick={() => {
                    setForgotPasswordType(loginType);
                    setForgotPasswordStep(1);
                    setForgotDialogOpen(true);
                  }}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Premium Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-14 font-bold text-base shadow-2xl shadow-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/70 relative overflow-hidden group" 
                disabled={isLoading}
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <span className="flex items-center gap-3 relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    {loginType === 'admin' ? <Shield size={20} /> : <Users size={20} />}
                    {loginType === 'admin' ? 'Admin Login' : 'Staff Login'}
                  </span>
                )}
              </Button>

              {/* Security Notice */}
              <div className="pt-2">
                <p className="text-xs text-center text-white/40 leading-relaxed">
                  🔒 Your login is secured with end-to-end encryption
                </p>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Protected by advanced security measures
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog - Enhanced */}
      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-2xl border-2 border-white/20 rounded-3xl text-white shadow-2xl">
          {forgotPasswordType === 'staff' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white text-xl">
                  <KeyRound size={20} className="text-green-400" />
                  Staff Password Reset
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Staff members need to contact an administrator to reset their password.
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <Users className="mx-auto h-16 w-16 text-green-400 mb-4" />
                  <p className="text-gray-300 leading-relaxed">
                    Please contact your administrator for password assistance.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => setForgotDialogOpen(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-12 font-semibold"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : forgotPasswordStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white text-xl">
                  <KeyRound size={20} className="text-green-400" />
                  Admin Password Reset
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Enter your admin username to begin the password reset process.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label htmlFor="forgotUsername" className="text-sm font-semibold text-green-100">Username</label>
                    <Input
                      id="forgotUsername"
                      type="text"
                      placeholder="Enter your username"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-2xl h-12 focus:border-green-400 focus:ring-2 focus:ring-green-400/50"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setForgotDialogOpen(false)} 
                  className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setForgotPasswordStep(2)} 
                  disabled={!forgotUsername}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          ) : forgotPasswordStep === 2 ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white text-xl">
                  <Shield size={20} className="text-green-400" />
                  Master Key Verification
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Enter the master key to verify your identity.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label htmlFor="masterKey" className="text-sm font-semibold text-green-100">Master Key</label>
                    <div className="relative">
                      <Input
                        id="masterKey"
                        type={showMasterKey ? "text" : "password"}
                        placeholder="Enter master key"
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-2xl h-12 pr-12 focus:border-green-400 focus:ring-2 focus:ring-green-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMasterKey(!showMasterKey)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-green-400"
                      >
                        {showMasterKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setForgotDialogOpen(false)} 
                  className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
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
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
                >
                  Verify
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white text-xl">
                  <Lock size={20} className="text-green-400" />
                  Set New Password
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Create a new password for your account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label htmlFor="newPassword" className="text-sm font-semibold text-green-100">New Password</label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-2xl h-12 pr-12 focus:border-green-400 focus:ring-2 focus:ring-green-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-green-400"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-green-100">Confirm Password</label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 rounded-2xl h-12 pr-12 focus:border-green-400 focus:ring-2 focus:ring-green-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-green-400"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setForgotDialogOpen(false)} 
                  className="rounded-2xl border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleResetPassword} 
                  disabled={!newPassword || !confirmPassword || resetLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Premium Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6 px-4 text-center z-10">
        <div className="flex flex-col items-center gap-3">
          <a 
            href="https://cuephoriatech.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 text-green-300 hover:text-green-200 transition-all text-sm font-medium"
          >
            <span>&lt; &gt;</span>
            <span className="text-green-300">Cuephoria</span>
            <span className="text-white/70">Tech</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-xs text-white/40">Powered by Cuephoria Tech © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
