import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import Profiles from "./profiles/page";
import Chat from "./chat/page";

export default function Home() {
    const [selectedKey, setSelectedKey] = useState('chat');

    return <div>
        <AppNavbar selectedKey={selectedKey} setSelectedKey={setSelectedKey} />

        {selectedKey == 'chat' && <Chat />}
        {selectedKey == 'profiles' && <Profiles />}
    </div>
}