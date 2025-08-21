import { type APIRoute } from "astro";
import { getListContent, patchView } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get("type");
        const lang = url.searchParams.get("lang");

        if (!type || !lang) {
            return new Response(`Faltan datos`, { status: 400 });
        }
        const response = await getListContent(type, lang);
        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al obtener los datos: ${error}`, { status: 500 });
    }
}

export const PATCH: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();
        const response = await patchView(id);
        return new Response(JSON.stringify(response), { status: 201 });
    } catch (error) {
        return new Response(`Ocurrió un error al registrar los datos: ${error}`, { status: 500 });
    }
}