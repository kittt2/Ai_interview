import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, updatePassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // ✅ Simple direct import

import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Crown,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          // Fetch user document from Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserDoc(userData);
            setEditedData({
              fullName: userData.fullName || "",
              phone: userData.phone || "",
              
            });
          } else {
            // Create initial user document if it doesn't exist
            const initialData = {
              fullName: firebaseUser.displayName || "",
              email: firebaseUser.email,
              createdAt: new Date().toISOString(),
              phone: "",
              company: "",
              position: "",
              bio: "",
              location: "",
              website: ""
            };
            await updateDoc(docRef, initialData);
            setUserDoc(initialData);
            setEditedData(initialData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        ...editedData,
        updatedAt: new Date().toISOString()
      });
      
      setUserDoc(prev => ({ ...prev, ...editedData }));
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!userDoc) return;
    
    setEditedData({
      fullName: userDoc.fullName || "",
      phone: userDoc.phone || "",
      company: userDoc.company || "",
      position: userDoc.position || "",
      bio: userDoc.bio || "",
      location: userDoc.location || "",
      website: userDoc.website || ""
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user) return;

    setSendingVerification(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Success",
        description: "Verification email sent! Check your inbox."
      });
    } catch (error) {
      console.error("Error sending verification:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive"
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  if (!user || !userDoc) return null;

  const userInitial = userDoc.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-violet-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-2xl sm:text-4xl">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    <Badge className={`px-2 py-1 ${user.emailVerified ? 'bg-green-600' : 'bg-yellow-600'}`}>
                      {user.emailVerified ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
                        {userDoc.fullName || "User"}
                      </h1>
                      <p className="text-gray-400 mb-2">{user.email}</p>
                    
                    </div>
                    
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      className="border-gray-700/50 bg-gray-800/50 text-gray-300 hover:text-gray-200 hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {userDoc.bio && (
                    <p className="text-gray-300 mt-4 max-w-2xl">{userDoc.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800/50">
            <TabsTrigger 
              value="profile" 
              className=" cursor-pointer text-white  data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="cursor-pointer text-white data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="premium" 
              className="cursor-pointer text-white data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center justify-between">
                  Personal Information
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={saving}
                        className="cursor-pointer bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        size="sm"
                        variant="outline"
                        className="bg-gray-600 text-gray-100 cursor-pointer"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editedData.fullName}
                      onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="bg-gray-800/50 border-gray-700/50 text-gray-100 disabled:opacity-70"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-800/30 border-gray-700/30 text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="bg-gray-800/50 border-gray-700/50 text-gray-100 disabled:opacity-70"
                      placeholder="Add phone number"
                    />
                  </div>

                 
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-gray-100 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-violet-400" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-100">Email Verification</h3>
                          <p className="text-sm text-gray-400">
                            {user.emailVerified ? "Your email is verified" : "Please verify your email"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={user.emailVerified ? "default" : "destructive"}
                            className={user.emailVerified ? "bg-green-600" : "bg-red-600"}
                          >
                            {user.emailVerified ? "Verified" : "Pending"}
                          </Badge>
                          {!user.emailVerified && (
                            <Button
                              size="sm"
                              onClick={handleSendVerification}
                              disabled={sendingVerification}
                              className="bg-violet-600 hover:bg-violet-700"
                            >
                              {sendingVerification ? "Sending..." : "Verify"}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-100">Account Created</h3>
                          <p className="text-sm text-gray-400">
                            {user.metadata?.creationTime ? 
                              new Date(user.metadata.creationTime).toLocaleDateString() : 
                              "Unknown"
                            }
                          </p>
                        </div>
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-100">Last Sign In</h3>
                        <p className="text-sm text-gray-400">
                          {user.metadata?.lastSignInTime ? 
                            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                            "Unknown"
                          }
                        </p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Change Card */}
              <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-gray-100">Change Password</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="bg-gray-800/50 border-gray-700/50 text-gray-100 pr-10"
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="bg-gray-800/50 border-gray-700/50 text-gray-100 pr-10"
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Premium Tab */}
          <TabsContent value="premium">
            <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                  Premium Features
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upgrade to unlock advanced interview preparation tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold text-gray-100 mb-2">Coming Soon</h3>
                  <p className="text-gray-400 mb-4">Premium features are currently in development</p>
                  <Button 
                    disabled 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 opacity-50"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}