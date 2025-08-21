import { type APIRoute } from "astro";
import { getBlogPost } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const lang = url.searchParams.get("lang");
        if (!id || !lang) {
            return new Response(`Faltan datos`, { status: 400 });
        }
        const response = await getBlogPost(id, lang);
        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al obtener los datos: ${error}`, { status: 500 });
    }
}