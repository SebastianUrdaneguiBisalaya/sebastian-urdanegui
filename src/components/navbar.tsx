import { headers } from "@constants/data";
import { useEffect, useState } from "preact/hooks";

interface Props {
    lang: string;
}

export default function Navbar ({ lang }: Props) {
    const headersFiltered = headers.filter((header) => header.lang === lang);
    const [activeIndex, setActiveIndex] = useState<string>("0");

    const updateActiveIndex = () => {
        const currentPath = window.location.pathname;
        const currentHeader = headersFiltered.find(header => header.url === currentPath);
        if (currentHeader) {
            setActiveIndex(currentHeader.id);
        }
    };

    useEffect(() => {
        updateActiveIndex();        
        document.addEventListener("astro:page-load", updateActiveIndex);
        
        return () => {
            document.removeEventListener("astro:page-load", updateActiveIndex);
        };
    }, [headersFiltered]);

    const handleClick = (id: string) => {
        setActiveIndex(id);
    }

    return (
        <div class="flex flex-row items-center justify-center gap-4 w-full border-b-[0.5px] border-gray-500 hidden-scroll">
            {
                headersFiltered.map((header) => {
                    return (
                    <a href={header.url} onClick={() => handleClick(header.id)} class={`shrink-0 flex flex-col items-center justify-center text-sm hover:bg-dark/5 dark:hover:bg-white/20 cursor-pointer group ${activeIndex === header.id && "bg-dark/5 dark:bg-white/20"}`}>
                        <span class="font-reddit text-black/60 dark:text-gray-300 text-center text-xs sm:text-sm p-4 group-hover:text-dark dark:group-hover:text-white">{header.content}</span>
                    </a>
                    )
                })
            }
        </div>
    )
}