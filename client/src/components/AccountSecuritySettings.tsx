import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { updatePassword, updateEmail } from '@/api/auth';
import { useToast } from '@/hooks/useToast';

interface AccountSecuritySettingsProps {
    userEmail: string;
    onEmailUpdate?: (newEmail: string) => void;
}

export function AccountSecuritySettings({ userEmail, onEmailUpdate }: AccountSecuritySettingsProps) {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [emailData, setEmailData] = useState({
        newEmail: '',
        password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
        emailPassword: false
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    const { toast } = useToast();
    const validateEmail = (email: string) => {
        const emailRegex = /^[A-Za-z0-9]([A-Za-z0-9._%-]*[A-Za-z0-9])?@[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    };
    const validatePassword = (password: string) => {
        // Regular expression to match at least one letter, one number, and one special character
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
        return regex.test(password);
    };

    const handlePasswordUpdate = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "Please fill in all password fields",
                variant: "destructive"
            });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive"
            });
            return;
        }

        const validation = validatePassword(passwordData.newPassword);
        if (!validation) {
            toast({
                title: "Error",
                description: "New Password must contain at least one letter, one number, and one special character, and be at least 7 characters long",
                variant: "destructive"
            });
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            toast({
                title: "Error",
                description: "New password must be different from current password",
                variant: "destructive"
            });
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);

            toast({
                title: "Success",
                description: "Password updated successfully",
            });

            // Reset form and close dialog
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update password",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleEmailUpdate = async () => {
        if (!emailData.newEmail || !emailData.password) {
            toast({
                title: "Error",
                description: "Please fill in all email fields",
                variant: "destructive"
            });
            return;
        }

        if (!validateEmail(emailData.newEmail)) {
            toast({
                title: "Error",
                description: "Please enter a valid email address",
                variant: "destructive"
            });
            return;
        }

        if (emailData.newEmail.toLowerCase() === userEmail.toLowerCase()) {
            toast({
                title: "Error",
                description: "New email must be different from current email",
                variant: "destructive"
            });
            return;
        }

        setIsUpdatingEmail(true);
        try {
            const response = await updateEmail(emailData.newEmail, emailData.password);

            toast({
                title: "Success",
                description: "Email updated successfully",
            });

            // Call callback to update parent component
            if (onEmailUpdate && response.user?.email) {
                onEmailUpdate(response.user.email);
            }

            // Reset form and close dialog
            setEmailData({
                newEmail: '',
                password: ''
            });
            setEmailDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update email",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Email Display */}
                <div>
                    <Label className="text-sm font-medium text-gray-600">Current Email</Label>
                    <p className="text-gray-800 mt-1">{userEmail}</p>
                </div>

                <Separator />

                {/* Update Email Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Update Email Address</h3>
                    <p className="text-sm text-gray-600">
                        Change your account email address. You'll need to verify the new email address.
                    </p>

                    <AlertDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">Change Email</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Update Email Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Enter your new email address and current password to confirm the change.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newEmail">New Email Address</Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={emailData.newEmail}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                                        placeholder="Enter new email address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emailPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="emailPassword"
                                            type={showPasswords.emailPassword ? "text" : "password"}
                                            value={emailData.password}
                                            onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('emailPassword')}
                                        >
                                            {showPasswords.emailPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleEmailUpdate}
                                    disabled={isUpdatingEmail}
                                >
                                    {isUpdatingEmail ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Email'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Separator />

                {/* Update Password Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Update Password</h3>
                    <p className="text-sm text-gray-600">
                        Keep your account secure with a strong password.
                    </p>

                    <AlertDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">Change Password</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Update Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Enter your current password and choose a new secure password.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
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
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                        <div className="flex items-center gap-1 text-xs text-red-600">
                                            <AlertTriangle className="h-3 w-3" />
                                            Passwords do not match
                                        </div>
                                    )}
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handlePasswordUpdate}
                                    disabled={isUpdatingPassword}
                                >
                                    {isUpdatingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}