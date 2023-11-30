import { useState } from "react";
import Button from "./Button";

interface ExpandableTextProps {
    text: string;
    initialLength: number;
    className?: string;
}

function ExpandableText({ text, initialLength, className }: ExpandableTextProps) {
    const [showAll, setShowAll] = useState(false);
    const space = "\u00A0\u00A0";
    return (
        <div className={`p-0 m-0 ${className}`}>
            {showAll ? text : text.substring(0, initialLength) + space + "..."}
            {initialLength < text.length && (
                <>
                    {space}
                    <a onClick={() => setShowAll(!showAll)}>{showAll ? "See less" : "See more"}</a>
                </>
            )}
        </div>
    );
}

export default ExpandableText;