import { Button, Input } from "@nextui-org/react";
import { useState } from "react";

export default function Home() {
    const [response, setResponse] = useState('');
    const [prompt, setPrompt] = useState('');

    const submitPrompt = () => {
        
    }

    return <div>
        <pre>
            { response }
        </pre>
        <Input label="prompt>" />
        <Button>Submit</Button>
    </div>
}