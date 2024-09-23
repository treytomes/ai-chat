import { Button, Input, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import Chat from "./chat";
import Profiles from "./profiles";

export default function Home() {
    return <div>
        <Tabs>
            <Tab title="Chat">
                <Chat />
            </Tab>
            <Tab title="Profiles">
                <Profiles />
            </Tab>
        </Tabs>
    </div>
}