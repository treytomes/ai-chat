import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
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

    useEffect(() => {
        loadConversation(conversationContext.conversationId).then(c => setConversationTitle(c.title));
    }, [conversationContext.conversationId]);
    
    return <Navbar>
        <NavbarBrand>
            <Logo />
            <p className="font-bold text-inherit">AI Chat</p>
        </NavbarBrand>
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
    </Navbar>
}