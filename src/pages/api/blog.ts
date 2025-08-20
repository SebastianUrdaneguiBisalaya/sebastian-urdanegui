import { type APIRoute } from "astro";
import { getBlogPost } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();
        const response = await getBlogPost(id);
        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al obtener los datos: ${error}`, { status: 500 });
    }
}