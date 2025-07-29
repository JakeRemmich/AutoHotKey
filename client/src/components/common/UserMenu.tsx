


import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import MenuItem from "./MenuItem";
import { AiOutlineMenu } from "react-icons/ai";

interface UserMenuProps {
    currentUser: Record<string, any> | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {

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
                <div className="flex ">

                    {currentUser && currentUser.role === "customer" && <NavItem label={"Ride History"} link={'/ride-history'} />}
                    {currentUser && currentUser.role === "driver" && <NavItem label={"Accepted rides"} link={'/accepted-rides'} />}

                </div>
                <div className="flex gap-2 items-center">

                    {currentUser && <div className="bg-theme1 text-white rounded-3xl ">
                        <Link to={currentUser.role === "customer" ? '/instructions' : '/ride-requests'}>
                            <Button label={currentUser.role === "customer" ? "Instructions" : "Ride requests"}
                                className="rounded-full" />
                        </Link>
                    </div>}
                    <div onClick={toggleOpen} ref={menuRef}
                        className="sm:p-4 xs:p-3 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
                        <AiOutlineMenu />

                        <div className="hidden md:block">

                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-50 rounded-xl shadow-md w-[40vw] lg:w-1/6 md:w-1/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className="flex flex-col cursor-pointer">
                        {currentUser ? (
                            <>
                                {currentUser.role === "customer" ?
                                    <>
                                        <MenuItem
                                            onClick={() => navigate("/instructions")}
                                            label="Instructions"
                                        />
                                        <MenuItem
                                            onClick={() => navigate("/ride-history")}
                                            label="Ride History"
                                        />
                                    </>
                                    :
                                    <>
                                        <MenuItem
                                            onClick={() => navigate("/ride-requests")}
                                            label="Ride requests"
                                        />
                                        <MenuItem
                                            onClick={() => navigate("/accepted-rides")}
                                            label="Accepted rides"
                                        />
                                    </>
                                }

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

interface NavItemProps {
    label: string;
    link: string
}

const NavItem: React.FC<NavItemProps> = ({ label, link }) => {
    return (
        <Link to={link}>
            <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                {label}
            </div>
        </Link>
    )
}

export default UserMenu;