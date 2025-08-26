


import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuItem from "./MenuItem";
import { AiOutlineMenu } from "react-icons/ai";
import { useAuth } from "@/contexts/AuthContext";


const UserMenu: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false);
    // const { logout } = useAuthStore()

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, [])

    // const handleLogout = async () => {
    //     try {
    //         await logout()
    //         toast.success("Logged out successfully")
    //         navigate('/auth/login')
    //     } catch (error: any) {
    //         toast.error(error.response.data.message)
    //     }
    // }
    const menuRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full">
            <div className="flex flex-row w-full items-center justify-between ">

                <div className="flex gap-2 items-center">


                    <div onClick={toggleOpen} ref={menuRef}
                        className="sm:p-4 xs:p-2 md:py-1 md:px-2 border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
                        <AiOutlineMenu size={20} />

                        <div className="hidden lg:block">

                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-50 rounded-xl shadow-md w-[40vw] lg:w-1/6 md:w-1/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className="flex flex-col cursor-pointer">
                        {isAuthenticated && user ? (
                            <>
                                <>
                                    {user.role === "admin" &&
                                        <MenuItem
                                            onClick={() => navigate("/admin")}
                                            label="Admin"
                                        />
                                    }
                                    <MenuItem
                                        onClick={() => navigate("/account-settings")}
                                        label="Account settings"
                                    />



                                    <>
                                        <MenuItem
                                            onClick={() => navigate("/dashboard")}
                                            label="Dashboard"
                                        />
                                        <MenuItem
                                            onClick={() => navigate("/instructions")}
                                            label="Instructions"
                                        />
                                        <MenuItem
                                            onClick={() => navigate("/pricing")}
                                            label="Pricing"
                                        />
                                        <MenuItem
                                            onClick={() => logout()}
                                            label="Logout"
                                        />
                                    </>
                                </>


                                {/* <MenuItem
                                    // onClick={handleLogout}
                                    label="Logout"
                                /> */}
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    onClick={() => navigate('/login')}
                                    label="Login"
                                />
                                <MenuItem
                                    onClick={() => navigate('/register')}
                                    label="Sign up"
                                />
                                <MenuItem
                                    onClick={() => navigate('/instructions')}
                                    label="Instructions"
                                />
                                <MenuItem
                                    onClick={() => navigate('/pricing')}
                                    label="Pricing"
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}


export default UserMenu;