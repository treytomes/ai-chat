import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@nextui-org/react";
import { Logo } from "./icons/Logo";
import { useContext, useEffect, useState } from "react";
import { ConversationContext } from "../context/ConversationContext";
import { loadConversation } from "../queries";

type AppNavbarProps = {
    selectedKey: string,
    setSelectedKey: React.Dispatch<React.SetStateAction<string>>,
}

export default function AppNavbar(props: AppNavbarProps) {
    const conversationContext = useContext(ConversationContext);
    const [conversationTitle, setConversationTitle] = useState<string>('');
    // const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        loadConversation(conversationContext.conversationId)
            .then(c => setConversationTitle(c.title))
            .catch(_e => setConversationTitle('New Conversation'));
    }, [conversationContext.conversationId]);
    
    // return <Navbar onMenuOpenChange={setIsMenuOpen}>
    return <Navbar>
        <NavbarContent>
            {/* <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} /> */}
            <NavbarBrand>
                <Logo />
                <p className="font-bold text-inherit">AI Chat</p>
            </NavbarBrand>
        </NavbarContent>
        <NavbarContent>
            <NavbarItem>
                <p className="font-bold text-inherit">{conversationTitle}</p>
            </NavbarItem>
        </NavbarContent>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={props.selectedKey === 'chat' ? true : undefined}>
                <Link color="foreground" href="#" aria-current={props.selectedKey === 'chat' ? 'page' : undefined} onClick={() => props.setSelectedKey("chat")}>
                    Chat
                </Link>
            </NavbarItem>
            <NavbarItem isActive={props.selectedKey === 'profiles' ? true : undefined}>
                <Link color="foreground" href="#" aria-current={props.selectedKey === 'profiles' ? 'page' : undefined} onClick={() => props.setSelectedKey("profiles")}>
                    Profiles
                </Link>
            </NavbarItem>
        </NavbarContent>

        {/* <NavbarContent justify="end">
            <NavbarItem className="hidden lg:flex">
                <Link href="#">Login</Link>
            </NavbarItem>
            <NavbarItem>
                <Button as={Link} color="primary" href="#" variant="flat">
                    Sign Up
                </Button>
            </NavbarItem>
        </NavbarContent> */}

        {/* <NavbarMenu className="bg-red-500 fixed w-64 h-64">
            <NavbarMenuItem>
                <Link color="foreground" href="#" size="lg" className="w-full" aria-current={props.selectedKey === 'chat' ? 'page' : undefined} onClick={() => props.setSelectedKey("chat")}>
                    Chat
                </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
                <Link color="foreground" href="#" size="lg" className="w-full" aria-current={props.selectedKey === 'profiles' ? 'page' : undefined} onClick={() => props.setSelectedKey("profiles")}>
                    Profiles
                </Link>
            </NavbarMenuItem>
        </NavbarMenu> */}
    </Navbar>
}