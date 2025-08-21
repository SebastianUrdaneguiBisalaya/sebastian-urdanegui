import { useState, useEffect } from "preact/hooks";
import { extractYearFromDate } from "@lib/fn";
import { headersTable } from "@constants/data";

interface Item {
    date: string;
    title: string;
    views: number;
    comments?: number;
    entity?: string;
    url: string;
}

interface Props {
    lang: string;
    type: "data-projects" | "web-projects" | "blog";
}

export default function Table ({ lang, type }: Props) {
    const [data, setData] = useState<Item[]>([]);
    const headers = headersTable.filter((header) => header.lang === lang);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/projects?type=${type}&lang=${lang}`);
                if (!response.ok) {
                    throw new Error(`Ocurrió un error al obtener los datos: ${response.statusText}`);
                }
                const result = await response.json();
                setData(result);
            } catch (error: unknown) {
                throw new Error(`Ocurrió un error al obtener los datos: ${error}`);
            }
        }
        fetchData();
    }, []);
    return (
        <table class="w-full table-fixed border-collapsex">
            <thead class="w-full">
                <tr>
                    <th colSpan={4} class="p-0">
                        <div class="flex flex-row items-center gap-4 px-2 w-full">
                            <span class="w-full max-w-[70px] font-sora text-dark/60 dark:text-white/60 text-sm font-light text-left pb-2">{headers[0].content}</span>
                            <span class="grow font-sora text-dark/60 dark:text-white/60 text-sm font-light text-left pb-2">{headers[1].content}</span>
                            <span class="w-full max-w-[70px] font-reddit text-dark/60 dark:text-white/60 text-sm font-light text-center pb-2">{headers[2].content}</span>
                            <span class="w-full max-w-[90px] font-reddit text-dark/60 dark:text-white/60 text-sm font-light text-center pb-2">{headers[3].content}</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="w-full">
                {
                    data?.map((item) => {
                        const isExternal = item.url.startsWith("http");
                        return (
                            <tr class="cursor-pointer border-t-[0.5px] border-gray-500 hover:bg-dark/5 dark:hover:bg-white/20 group">
                                <td colSpan={4} class="p-0">
                                    <a
                                        href={item.url}
                                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        class="flex flex-row items-center gap-4 p-2 w-full cursor-pointer"
                                    >
                                        <span class="w-full max-w-[70px] font-reddit text-dark/80 dark:text-white/80 text-sm py-2">{extractYearFromDate(item.date)}</span>
                                        <div class="flex flex-col gap-0.5 grow">
                                            <span class="font-sora text-dark/80 dark:text-white/95 text-sm group-hover:underline">{item.title}</span>
                                            {
                                                item.entity && <span class="font-reddit text-dark/60 dark:text-white/75 text-xs font-light">{item.entity}</span>
                                            }
                                        </div>
                                        <span class="w-full max-w-[70px] font-reddit text-dark/80 dark:text-white/80 text-sm text-center">
                                            <div class="flex flex-row items-center justify-center gap-2">
                                                <span class="opacity-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 32 32"><path fill="currentColor" d="M30.94 15.66A16.69 16.69 0 0 0 16 5A16.69 16.69 0 0 0 1.06 15.66a1 1 0 0 0 0 .68A16.69 16.69 0 0 0 16 27a16.69 16.69 0 0 0 14.94-10.66a1 1 0 0 0 0-.68M16 25c-5.3 0-10.9-3.93-12.93-9C5.1 10.93 10.7 7 16 7s10.9 3.93 12.93 9C26.9 21.07 21.3 25 16 25"/><path fill="currentColor" d="M16 10a6 6 0 1 0 6 6a6 6 0 0 0-6-6m0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4"/></svg>
                                                </span>
                                                <span class="font-reddit text-dark/80 dark:text-white/80 text-sm">
                                                    {item.views ?? 0}
                                                </span>
                                            </div>
                                        </span>
                                        <span class="w-full max-w-[90px] font-reddit text-dark/80 dark:text-white/80 text-sm text-center">
                                            <div class="flex flex-row items-center justify-center gap-2 w-full cursor-pointer">
                                                <span class="opacity-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.3 16.7a9 9 0 1 1 3 3L3 21z"/></svg>
                                                </span>
                                                <span class="font-reddit text-dark/80 dark:text-white/80 text-sm">
                                                    {item.comments ?? 0}
                                                </span>
                                            </div>
                                        </span>
                                    </a>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

