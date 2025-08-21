import { type APIRoute } from "astro";
import { getCommentsByBlogPost, postComment } from "@db/client";

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) {
            return new Response(`Faltan datos`, { status: 400 });
        }
        const response = await getCommentsByBlogPost(id);
        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al obtener los datos: ${error}`, { status: 500 });
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id, user_name, comment } = await request.json();
        if (!comment.trim()) {
            return new Response(`Faltan datos`, { status: 400 });
        }
        const response = await postComment(id, user_name, comment);
        return new Response(JSON.stringify(response), { status: 201 });
    } catch (error: unknown) {
        return new Response(`Ocurrió un error al registrar los datos: ${error}`, { status: 500 });
    }
}