import { useState, useEffect } from "preact/hooks";
import { extractYearFromDate } from "@lib/fn";
import { headersTable } from "@constants/data";

interface Item {
    date: string;
    title: string;
		description?: string;
    views?: number;
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
        <div class="flex flex-col w-full">
            <div class="flex flex-row items-center gap-4 w-full">
                <span class="w-[70px] font-sora prose dark:prose-invert text-xs sm:text-sm font-light text-left pb-2">
                    {headers[0].content}
                </span>
                <span class="grow font-sora prose dark:prose-invert text-xs sm:text-sm font-light text-left pb-2">
                    {headers[1].content}
                </span>
                {
                    type === "blog" && (
                        <span class="hidden sm:block w-[70px] font-sora prose dark:prose-invert text-xs sm:text-sm font-light text-center pb-2">
                            {headers[2].content}
                        </span>
                    )
                }
                {
                    type === "blog" && (
                        <span class="hidden sm:block w-[95px] font-sora prose dark:prose-invert text-xs sm:text-sm font-light text-center pb-2">
                            {headers[3].content}
                        </span>
                    )
                }
            </div>
            {
                data?.map((item) => {
                    const isExternal = item.url.startsWith("http");
										const url = type === "blog" && lang === "es" ? `/es${item.url}` : `${item.url}`;
                    return (
                        <a
                            href={url}
                            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            class={`grid ${type === "blog" ? "grid-cols-[70px_minmax(0,1fr)] sm:grid-cols-[70px_minmax(0,1fr)_70px_95px]" : "grid-cols-[70px_minmax(0,1fr)]"} gap-4 py-2 px-0 sm:px-2 w-full cursor-pointer border-t-[0.5px] border-gray-500 hover:bg-dark/5 dark:hover:bg-white/20 group`}
                        >
                            <div class="flex flex-col">
                                <span class="font-reddit prose dark:prose-invert text-sm py-2">{extractYearFromDate(item.date)}</span>
                            </div>
                            <div class="flex flex-col gap-0.5 grow">
                                <span class="font-sora prose dark:prose-invert text-sm group-hover:underline">{item.title}</span>
																<span class="font-sora prose dark:prose-invert text-xs">{item.description}</span>
                                {
                                    item.entity && <span class="font-reddit prose dark:prose-invert text-xs font-light">{item.entity}</span>
                                }
                            </div>
                            {
                                type === "blog" && (
                                    <div class="hidden sm:flex flex-row items-center justify-center gap-2">
                                        <span class="opacity-50 prose dark:prose-invert">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 32 32"><path fill="currentColor" d="M30.94 15.66A16.69 16.69 0 0 0 16 5A16.69 16.69 0 0 0 1.06 15.66a1 1 0 0 0 0 .68A16.69 16.69 0 0 0 16 27a16.69 16.69 0 0 0 14.94-10.66a1 1 0 0 0 0-.68M16 25c-5.3 0-10.9-3.93-12.93-9C5.1 10.93 10.7 7 16 7s10.9 3.93 12.93 9C26.9 21.07 21.3 25 16 25"/><path fill="currentColor" d="M16 10a6 6 0 1 0 6 6a6 6 0 0 0-6-6m0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4"/></svg>
                                        </span>
                                        <span class="font-reddit prose dark:prose-invert text-sm">
                                            {item.views ?? 0}
                                        </span>
                                    </div>
                                )
                            }
                            {
                                type === "blog" && (
                                    <div class="hidden sm:flex flex-row items-center justify-center gap-2">
                                        <span class="opacity-50 prose dark:prose-invert">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.3 16.7a9 9 0 1 1 3 3L3 21z"/></svg>
                                        </span>
                                        <span class="font-reddit prose dark:prose-invert text-sm">
                                            {item.comments ?? 0}
                                        </span>
                                    </div>
                                )
                            }
                        </a>
                    )
                })
            }
        </div>
    )
}

